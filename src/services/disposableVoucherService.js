import pool from '../config/database';
import logger from '../config/logger';
import { generateUniqueCode } from '../utils/voucherUtils';

export const createVoucher = async (mealTypeId, expiredAt, createdBy) => {
  const db = await pool.getConnection();
  
  try {
    const formattedDate = new Date(expiredAt).toISOString().split('T')[0];
    const code = await generateUniqueCode(db);

    const [result] = await db.execute(
      `INSERT INTO disposable_vouchers 
       (code, meal_type_id, expired_at, created_by) 
       VALUES (?, ?, ?, ?)`,
      [code, mealTypeId, formattedDate, createdBy]
    );

    const [voucher] = await db.execute(
      `SELECT dv.*, mt.name as meal_type_name, u.name as created_by_name
       FROM disposable_vouchers dv 
       JOIN meal_types mt ON dv.meal_type_id = mt.id 
       JOIN users u ON dv.created_by = u.id
       WHERE dv.id = ?`,
      [result.insertId]
    );

    logger.info(`Voucher descartável criado com sucesso: ${code} por usuário ${createdBy}`);
    return voucher[0];
  } finally {
    db.release();
  }
};

export const validateMealType = async (mealTypeId) => {
  const db = await pool.getConnection();
  
  try {
    const [mealTypes] = await db.execute(
      'SELECT id FROM meal_types WHERE id = ? AND is_active = TRUE',
      [mealTypeId]
    );

    if (mealTypes.length === 0) {
      throw new Error('Tipo de refeição inválido ou inativo');
    }
  } finally {
    db.release();
  }
};