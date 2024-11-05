import pool from '../config/database';
import logger from '../config/logger';
import { validateVoucherTime } from '../utils/voucherValidations';
import { VOUCHER_TYPES } from '../utils/voucherTypes';

export const validateDisposableVoucher = async (req, res) => {
  const { code, meal_type_id } = req.body;
  let db;
  
  try {
    db = await pool.getConnection();

    const [vouchers] = await db.execute(
      `SELECT dv.*, mt.* 
       FROM disposable_vouchers dv
       JOIN meal_types mt ON dv.meal_type_id = mt.id
       WHERE dv.code = ? 
       AND dv.is_used = FALSE 
       AND dv.meal_type_id = ?
       AND (dv.expired_at IS NULL OR dv.expired_at >= CURDATE())`,
      [code, meal_type_id]
    );

    if (vouchers.length === 0) {
      return res.status(400).json({ 
        error: 'Voucher não encontrado, já utilizado ou expirado'
      });
    }

    const voucher = vouchers[0];

    await db.execute(
      'UPDATE disposable_vouchers SET is_used = TRUE, used_at = NOW() WHERE id = ?',
      [voucher.id]
    );

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
