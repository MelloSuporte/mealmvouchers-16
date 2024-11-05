import pool from '../config/database';
import logger from '../config/logger';

const generateUniqueCode = async (db) => {
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    const code = String(Math.floor(1000 + Math.random() * 9000));
    
    const [disposableVouchers] = await db.execute(
      'SELECT id FROM disposable_vouchers WHERE code = ?',
      [code]
    );

    const [userVouchers] = await db.execute(
      'SELECT id FROM users WHERE voucher = ?',
      [code]
    );

    if (disposableVouchers.length === 0 && userVouchers.length === 0) {
      return code;
    }

    attempts++;
  }
  
  throw new Error('Não foi possível gerar um código único após várias tentativas');
};

export const checkVoucherCode = async (req, res) => {
  const { code } = req.body;
  let db;
  
  try {
    db = await pool.getConnection();
    
    if (!/^\d{4}$/.test(code)) {
      logger.warn(`Formato inválido de código: ${code}`);
      return res.status(400).json({ 
        error: 'Código deve conter exatamente 4 dígitos numéricos',
        exists: false 
      });
    }

    const [disposableVouchers] = await db.execute(
      'SELECT id FROM disposable_vouchers WHERE code = ?',
      [code]
    );

    const [userVouchers] = await db.execute(
      'SELECT id FROM users WHERE voucher = ?',
      [code]
    );

    return res.json({ exists: disposableVouchers.length > 0 || userVouchers.length > 0 });
  } catch (error) {
    logger.error('Erro ao verificar código do voucher:', error);
    return res.status(500).json({ 
      error: 'Erro interno ao verificar código do voucher',
      exists: false
    });
  } finally {
    if (db) db.release();
  }
};

export const createDisposableVoucher = async (req, res) => {
  const { meal_type_id, created_by, expired_at } = req.body;
  let db;
  
  try {
    db = await pool.getConnection();
    
    const [mealTypes] = await db.execute(
      'SELECT id FROM meal_types WHERE id = ? AND is_active = TRUE',
      [meal_type_id]
    );

    if (mealTypes.length === 0) {
      logger.warn(`Tipo de refeição inválido ou inativo: ${meal_type_id}`);
      return res.status(400).json({ 
        error: 'Tipo de refeição inválido ou inativo'
      });
    }

    const formattedDate = new Date(expired_at).toISOString().split('T')[0];
    const code = await generateUniqueCode(db);

    const [result] = await db.execute(
      `INSERT INTO disposable_vouchers 
       (code, meal_type_id, created_by, expired_at) 
       VALUES (?, ?, ?, ?)`,
      [code, meal_type_id, created_by, formattedDate]
    );

    const [voucher] = await db.execute(
      `SELECT dv.*, mt.name as meal_type_name 
       FROM disposable_vouchers dv 
       JOIN meal_types mt ON dv.meal_type_id = mt.id 
       WHERE dv.id = ?`,
      [result.insertId]
    );

    logger.info(`Voucher descartável criado com sucesso: ${code}`);
    return res.json({ 
      success: true, 
      message: 'Voucher criado com sucesso',
      voucher: voucher[0]
    });
  } catch (error) {
    logger.error('Erro ao criar voucher descartável:', error);
    return res.status(500).json({ 
      error: 'Erro ao criar voucher descartável: ' + error.message
    });
  } finally {
    if (db) db.release();
  }
};

export const validateDisposableVoucher = async (req, res) => {
  const { code, mealType } = req.body;
  let db;
  
  try {
    db = await pool.getConnection();
    
    if (!/^\d{4}$/.test(code)) {
      return res.status(400).json({ 
        error: 'Código do voucher deve conter 4 dígitos numéricos'
      });
    }

    // Primeiro, verifica se o voucher existe e está válido
    const [vouchers] = await db.execute(
      `SELECT dv.*, mt.name as meal_type_name, mt.id as meal_type_id,
              mt.start_time, mt.end_time, mt.tolerance_minutes
       FROM disposable_vouchers dv 
       JOIN meal_types mt ON dv.meal_type_id = mt.id 
       WHERE dv.code = ? AND dv.is_used = FALSE 
       AND (dv.expired_at IS NULL OR DATE(dv.expired_at) >= CURDATE())`,
      [code]
    );

    if (vouchers.length === 0) {
      logger.warn(`Tentativa de uso de voucher inválido ou expirado: ${code}`);
      return res.status(401).json({ 
        error: 'Voucher inválido, já utilizado ou expirado'
      });
    }

    const voucher = vouchers[0];

    // Busca o tipo de refeição pelo nome
    const [mealTypes] = await db.execute(
      'SELECT id, name, start_time, end_time FROM meal_types WHERE name = ? AND is_active = TRUE',
      [mealType]
    );

    if (mealTypes.length === 0) {
      logger.warn(`Tipo de refeição inválido ou inativo: ${mealType}`);
      return res.status(400).json({ 
        error: 'Tipo de refeição inválido ou inativo'
      });
    }

    // Verifica se o tipo de refeição corresponde ao voucher
    if (voucher.meal_type_id !== mealTypes[0].id) {
      logger.warn(`Tipo de refeição não corresponde ao voucher: ${mealType}`);
      return res.status(400).json({ 
        error: 'Tipo de refeição não corresponde ao voucher'
      });
    }

    // Verifica o horário atual
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:mm format

    const mealType0 = mealTypes[0];
    const toleranceMinutes = voucher.tolerance_minutes || 15; // Default tolerance of 15 minutes

    // Adiciona tolerância ao horário de término
    const endTime = new Date();
    const [endHours, endMinutes] = mealType0.end_time.split(':');
    endTime.setHours(parseInt(endHours), parseInt(endMinutes) + toleranceMinutes);
    const endTimeWithTolerance = endTime.toTimeString().slice(0, 5);

    if (currentTime < mealType0.start_time || currentTime > endTimeWithTolerance) {
      logger.warn(`Tentativa de uso fora do horário permitido: ${currentTime}`);
      return res.status(400).json({
        error: `Esta refeição só pode ser utilizada entre ${mealType0.start_time} e ${mealType0.end_time} (tolerância de ${toleranceMinutes} minutos)`
      });
    }

    // Marca o voucher como utilizado
    await db.execute(
      'UPDATE disposable_vouchers SET is_used = TRUE, used_at = NOW(3) WHERE id = ?',
      [voucher.id]
    );

    logger.info(`Voucher descartável utilizado com sucesso: ${code}`);
    return res.json({ 
      success: true, 
      message: 'Voucher validado com sucesso'
    });
  } catch (error) {
    logger.error('Erro ao validar voucher descartável:', error);
    return res.status(500).json({ 
      error: 'Erro ao validar voucher descartável: ' + error.message
    });
  } finally {
    if (db) db.release();
  }
};