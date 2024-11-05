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
    
    // Obter hora do servidor uma única vez
    const [timeResult] = await db.execute('SELECT NOW() as current_time');
    const currentTime = timeResult[0].current_time;
    const formattedTime = new Date(currentTime).toTimeString().slice(0, 5);
    
    // Buscar usuário com uma única query
    const [users] = await db.execute(
      'SELECT u.*, mt.id as meal_type_id, mt.name as meal_type_name, mt.start_time, mt.end_time, mt.tolerance_minutes FROM users u LEFT JOIN meal_types mt ON mt.name = ? WHERE u.cpf = ? AND u.voucher = ? AND u.is_suspended = FALSE',
      [mealType, cpf, code]
    );

    if (users.length === 0) {
      return res.status(401).json({ 
        error: 'Usuário não encontrado ou voucher inválido'
      });
    }

    const user = users[0];

    validateVoucherByType(VOUCHER_TYPES.NORMAL, { code, cpf, mealType, user });

    if (!isWithinShiftHours(user.turno, formattedTime)) {
      return res.status(403).json({
        error: `${user.name}, você está fora do horário do ${user.turno} turno`,
        userName: user.name,
        turno: user.turno
      });
    }

    // Verificar uso diário em uma única query
    const [usedMeals] = await db.execute(
      `SELECT COUNT(*) as count FROM voucher_usage 
       WHERE user_id = ? AND DATE(used_at) = DATE(?)`,
      [user.id, currentTime]
    );

    if (usedMeals[0].count >= 2) {
      // Verificar voucher extra apenas se necessário
      const [extraVoucher] = await db.execute(
        'SELECT id FROM extra_vouchers WHERE user_id = ? AND valid_until >= DATE(?) AND used = FALSE LIMIT 1',
        [user.id, currentTime]
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

    // Registrar uso do voucher
    await db.execute(
      'INSERT INTO voucher_usage (user_id, meal_type_id, used_at) VALUES (?, ?, ?)',
      [user.id, user.meal_type_id, currentTime]
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