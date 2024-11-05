import pool from '../config/database';
import logger from '../config/logger';
import { generateUniqueCode } from '../utils/voucherGenerationUtils';
import { validateVoucherCode, validateMealType, validateExistingVoucher } from '../services/voucherValidationService';
import { validateVoucherTime } from '../utils/voucherValidations';
import { findActiveMealType, markVoucherAsUsed } from '../services/voucherQueries';

export const checkVoucherCode = async (req, res) => {
  const { code } = req.body;
  let db;
  
  try {
    db = await pool.getConnection();
    const result = await validateVoucherCode(db, code);
    return res.json(result);
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
    
    await validateMealType(db, meal_type_id);
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
    const voucher = await validateExistingVoucher(db, code, meal_type_id);
    
    // Validar horário da refeição
    const mealType = await findActiveMealType(db, voucher.meal_type_name);
    const currentTime = new Date().toTimeString().slice(0, 5);
    const toleranceMinutes = mealType.tolerance_minutes || 15;

    validateVoucherTime(currentTime, mealType, toleranceMinutes);
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