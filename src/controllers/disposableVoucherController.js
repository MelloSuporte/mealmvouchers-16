import pool from '../config/database';
import logger from '../config/logger';

const generateUniqueCode = async (db) => {
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    // Gera número entre 1000 e 9999
    const code = String(Math.floor(1000 + Math.random() * 9000));
    
    // Verifica se existe na tabela de vouchers descartáveis
    const [disposableVouchers] = await db.execute(
      'SELECT id FROM disposable_vouchers WHERE code = ?',
      [code]
    );

    // Verifica se existe na tabela de usuários (vouchers regulares)
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
    
    // Verifica se o tipo de refeição existe e está ativo
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

    // Gera código único
    const code = await generateUniqueCode(db);

    // Insere o novo voucher
    const [result] = await db.execute(
      `INSERT INTO disposable_vouchers 
       (code, meal_type_id, created_by, expired_at) 
       VALUES (?, ?, ?, ?)`,
      [code, meal_type_id, created_by, expired_at]
    );

    // Busca o voucher criado com informações completas
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

    const [vouchers] = await db.execute(
      `SELECT dv.*, mt.name as meal_type_name 
       FROM disposable_vouchers dv 
       JOIN meal_types mt ON dv.meal_type_id = mt.id 
       WHERE dv.code = ? AND dv.is_used = FALSE 
       AND (dv.expired_at IS NULL OR dv.expired_at > NOW())`,
      [code]
    );

    if (vouchers.length === 0) {
      return res.status(401).json({ 
        error: 'Voucher inválido ou expirado'
      });
    }

    const voucher = vouchers[0];
    
    if (voucher.meal_type_name !== mealType) {
      return res.status(400).json({ 
        error: 'Tipo de refeição inválido para este voucher'
      });
    }

    await db.execute(
      'UPDATE disposable_vouchers SET is_used = TRUE, used_at = NOW(3) WHERE id = ?',
      [voucher.id]
    );

    return res.json({ 
      success: true, 
      message: 'Voucher validado com sucesso'
    });
  } catch (error) {
    logger.error('Erro ao validar voucher descartável:', error);
    return res.status(500).json({ 
      error: 'Erro interno ao validar voucher descartável'
    });
  } finally {
    if (db) db.release();
  }
};