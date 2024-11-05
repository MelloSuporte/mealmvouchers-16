import pool from '../config/database';
import logger from '../config/logger';
import { generateUniqueCode } from '../utils/voucherGenerationUtils';
import { validateVoucherTime } from '../utils/voucherValidations';

export const checkVoucherCode = async (req, res) => {
  const { code } = req.body;
  let db;
  
  try {
    db = await pool.getConnection();
    const [vouchers] = await db.execute(
      `SELECT dv.*, mt.name as meal_type_name 
       FROM disposable_vouchers dv 
       JOIN meal_types mt ON dv.meal_type_id = mt.id 
       WHERE dv.code = ? AND dv.is_used = FALSE`,
      [code]
    );

    return res.json({ 
      exists: vouchers.length > 0,
      voucher: vouchers[0] || null
    });
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
  const { meal_type_id, expired_at } = req.body;
  let db;
  
  try {
    if (!meal_type_id || !expired_at) {
      return res.status(400).json({ 
        error: 'Tipo de refeição e data de expiração são obrigatórios'
      });
    }

    db = await pool.getConnection();
    
    // Verificar se o tipo de refeição existe
    const [mealTypes] = await db.execute(
      'SELECT * FROM meal_types WHERE id = ? AND is_active = TRUE',
      [meal_type_id]
    );

    if (mealTypes.length === 0) {
      return res.status(400).json({ 
        error: 'Tipo de refeição inválido ou inativo'
      });
    }

    const formattedDate = new Date(expired_at).toISOString().split('T')[0];
    const code = await generateUniqueCode(db);

    const [result] = await db.execute(
      'INSERT INTO disposable_vouchers (code, meal_type_id, expired_at) VALUES (?, ?, ?)',
      [code, meal_type_id, formattedDate]
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
    return res.status(400).json({ 
      error: 'Erro ao criar voucher descartável: ' + error.message
    });
  } finally {
    if (db) db.release();
  }
};

export const validateDisposableVoucher = async (req, res) => {
  const { code, meal_type_id } = req.body;
  let db;
  
  try {
    if (!code || !meal_type_id) {
      return res.status(400).json({ 
        error: 'Código do voucher e tipo de refeição são obrigatórios'
      });
    }

    db = await pool.getConnection();
    
    // Buscar o voucher descartável
    const [vouchers] = await db.execute(
      `SELECT dv.*, mt.name as meal_type_name, mt.start_time, mt.end_time, mt.tolerance_minutes
       FROM disposable_vouchers dv 
       JOIN meal_types mt ON dv.meal_type_id = mt.id 
       WHERE dv.code = ? AND dv.meal_type_id = ? AND dv.is_used = FALSE`,
      [code, meal_type_id]
    );

    if (vouchers.length === 0) {
      return res.status(400).json({ 
        error: 'Voucher não encontrado, já utilizado ou tipo de refeição incorreto'
      });
    }

    const voucher = vouchers[0];

    // Verificar se o voucher está expirado
    if (voucher.expired_at && new Date(voucher.expired_at) < new Date()) {
      return res.status(400).json({ 
        error: 'Voucher expirado'
      });
    }

    // Validar horário da refeição
    const currentTime = new Date().toTimeString().slice(0, 5);
    validateVoucherTime(currentTime, voucher, voucher.tolerance_minutes || 15);

    // Marcar voucher como usado
    await db.execute(
      'UPDATE disposable_vouchers SET is_used = TRUE, used_at = NOW() WHERE id = ?',
      [voucher.id]
    );

    logger.info(`Voucher descartável utilizado com sucesso: ${code}`);
    return res.json({ 
      success: true, 
      message: 'Voucher validado com sucesso'
    });
  } catch (error) {
    logger.error('Erro ao validar voucher descartável:', error);
    return res.status(400).json({ 
      error: error.message || 'Erro ao validar voucher descartável'
    });
  } finally {
    if (db) db.release();
  }
};