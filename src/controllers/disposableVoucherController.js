import pool from '../config/database';
import logger from '../config/logger';
import { validateVoucherTime, validateVoucherByType } from '../utils/voucherValidations';
import { findActiveMealType, markVoucherAsUsed } from '../services/voucherQueries';
import { VOUCHER_TYPES } from '../utils/voucherTypes';

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
  const { meal_type_id, expired_at } = req.body;
  let db;
  
  try {
    if (!meal_type_id || !expired_at) {
      return res.status(400).json({ 
        error: 'Todos os campos são obrigatórios'
      });
    }

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
       (code, meal_type_id, expired_at) 
       VALUES (?, ?, ?)`,
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
    // Validação específica para voucher descartável
    validateVoucherByType(VOUCHER_TYPES.DISPOSABLE, { 
      code, 
      mealType: meal_type_id 
    });

    db = await pool.getConnection();

    // Buscar o voucher descartável
    const [vouchers] = await db.execute(
      `SELECT dv.*, mt.* 
       FROM disposable_vouchers dv
       JOIN meal_types mt ON dv.meal_type_id = mt.id
       WHERE dv.code = ? AND dv.is_used = FALSE`,
      [code]
    );

    if (vouchers.length === 0) {
      logger.warn(`Voucher descartável não encontrado ou já utilizado: ${code}`);
      return res.status(400).json({ 
        error: 'Voucher não encontrado ou já utilizado'
      });
    }

    const voucher = vouchers[0];

    // Verificar se o voucher está expirado
    const expirationDate = new Date(voucher.expired_at);
    const now = new Date();
    if (expirationDate < now) {
      return res.status(400).json({ 
        error: 'Voucher expirado'
      });
    }

    // Verificar se o tipo de refeição corresponde
    if (voucher.meal_type_id !== parseInt(meal_type_id)) {
      return res.status(400).json({ 
        error: 'Tipo de refeição não corresponde ao voucher'
      });
    }

    const mealTypeData = await findActiveMealType(db, voucher.name);
    const currentTime = now.toTimeString().slice(0, 5);
    const toleranceMinutes = voucher.tolerance_minutes || 15;

    validateVoucherTime(currentTime, mealTypeData, toleranceMinutes);
    await markVoucherAsUsed(db, voucher.id);

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