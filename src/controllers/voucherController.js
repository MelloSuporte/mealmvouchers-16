import pool from '../config/database';
import logger from '../config/logger';
import { validateVoucherTime, validateVoucherByType } from '../utils/voucherValidations';
import { isWithinShiftHours, getAllowedMealsByShift } from '../utils/shiftUtils';
import { VOUCHER_TYPES } from '../utils/voucherTypes';

export const validateVoucher = async (req, res) => {
  const { cpf, voucherCode: code, mealType } = req.body;
  let db;
  
  try {
    db = await pool.getConnection();
    
    const [users] = await db.execute(
      `SELECT u.*, mt.id as meal_type_id, mt.name as meal_type_name, 
              mt.start_time, mt.end_time, mt.tolerance_minutes 
       FROM users u 
       LEFT JOIN meal_types mt ON mt.name = ? 
       WHERE u.cpf = ? AND u.voucher = ? AND u.is_suspended = FALSE`,
      [mealType, cpf, code]
    );

    if (users.length === 0) {
      return res.status(401).json({ 
        error: 'Usuário não encontrado ou voucher inválido'
      });
    }

    const user = users[0];

    validateVoucherByType(VOUCHER_TYPES.NORMAL, { code, cpf, mealType, user });

    const [usedMeals] = await db.execute(
      `SELECT COUNT(*) as count 
       FROM voucher_usage 
       WHERE user_id = ? AND DATE(used_at) = CURDATE()`,
      [user.id]
    );

    if (usedMeals[0].count >= 2) {
      const [extraVoucher] = await db.execute(
        `SELECT id 
         FROM extra_vouchers 
         WHERE user_id = ? AND valid_until >= CURDATE() 
         AND used = FALSE LIMIT 1`,
        [user.id]
      );

      if (extraVoucher.length === 0) {
        return res.status(403).json({
          error: 'Limite diário de refeições atingido',
          userName: user.name,
          turno: user.turno
        });
      }

      await db.execute(
        'UPDATE extra_vouchers SET used = TRUE WHERE id = ?',
        [extraVoucher[0].id]
      );
    }

    await db.execute(
      'INSERT INTO voucher_usage (user_id, meal_type_id) VALUES (?, ?)',
      [user.id, user.meal_type_id]
    );

    return res.json({ 
      success: true, 
      message: 'Voucher validado com sucesso',
      userName: user.name,
      turno: user.turno
    });
  } catch (error) {
    logger.error('Erro ao validar voucher:', error);
    return res.status(400).json({ 
      error: error.message || 'Erro ao validar voucher'
    });
  } finally {
    if (db) db.release();
  }
};