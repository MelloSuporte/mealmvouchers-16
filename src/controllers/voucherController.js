import pool from '../config/database';
import logger from '../config/logger';
import { isWithinShiftHours, getAllowedMealsByShift } from '../utils/shiftUtils';

export const validateVoucher = async (req, res) => {
  const { cpf, voucherCode, mealType } = req.body;
  let db;
  
  try {
    db = await pool.getConnection();
    
    // Get current server time
    const [timeResult] = await db.execute('SELECT TIME(NOW()) as current_time');
    const currentTime = timeResult[0].current_time.slice(0, 5); // Format: HH:mm
    
    // Get user and their shift
    const [users] = await db.execute(
      'SELECT * FROM users WHERE cpf = ? AND voucher = ?',
      [cpf, voucherCode]
    );

    if (users.length === 0) {
      logger.warn(`Invalid voucher attempt - CPF: ${cpf}, Code: ${voucherCode}`);
      return res.status(401).json({ 
        error: 'Voucher inválido',
        userName: null,
        turno: null 
      });
    }

    const user = users[0];
    
    if (user.is_suspended) {
      logger.warn(`Suspended user attempt - User: ${user.name}`);
      return res.status(403).json({ 
        error: 'Usuário suspenso',
        userName: user.name,
        turno: user.turno 
      });
    }

    // Check if user is within their shift hours using server time
    if (!isWithinShiftHours(user.turno, currentTime)) {
      logger.warn(`Out of shift attempt - User: ${user.name}, Shift: ${user.turno}, Time: ${currentTime}`);
      return res.status(403).json({
        error: `${user.name}, você está fora do horário do ${user.turno} turno`,
        userName: user.name,
        turno: user.turno
      });
    }

    // Get today's meal usage using server date
    const [usedMeals] = await db.execute(
      `SELECT mt.name 
       FROM voucher_usage vu 
       JOIN meal_types mt ON vu.meal_type_id = mt.id 
       WHERE vu.user_id = ? 
       AND DATE(vu.used_at) = DATE(NOW())`,
      [user.id]
    );

    const allowedMeals = getAllowedMealsByShift(user.turno);
    
    if (!allowedMeals.includes(mealType)) {
      logger.warn(`Invalid meal type attempt - User: ${user.name}, Meal: ${mealType}`);
      return res.status(403).json({
        error: `${mealType} não está disponível para o ${user.turno} turno`,
        userName: user.name,
        turno: user.turno
      });
    }

    if (usedMeals.length >= 2) {
      // Check if this is an extra voucher request
      const [extraVoucher] = await db.execute(
        'SELECT * FROM extra_vouchers WHERE user_id = ? AND valid_until >= ? AND used = FALSE',
        [user.id, today]
      );

      if (!extraVoucher.length) {
        logger.warn(`Daily limit exceeded - User: ${user.name}`);
        return res.status(403).json({
          error: 'Limite diário de refeições atingido',
          userName: user.name,
          turno: user.turno
        });
      }
    }

    // Validate meal combination rules
    const usedMealTypes = usedMeals.map(m => m.name);
    if (usedMealTypes.includes(mealType)) {
      logger.warn(`Duplicate meal attempt - User: ${user.name}, Meal: ${mealType}`);
      return res.status(403).json({
        error: 'Não é permitido repetir o mesmo tipo de refeição',
        userName: user.name,
        turno: user.turno
      });
    }

    // Record the meal usage with server timestamp
    await db.execute(
      'INSERT INTO voucher_usage (user_id, meal_type_id, used_at) VALUES (?, (SELECT id FROM meal_types WHERE name = ?), NOW())',
      [user.id, mealType]
    );

    logger.info(`Successful voucher validation - User: ${user.name}, Meal: ${mealType}`);
    res.json({ 
      success: true, 
      message: 'Voucher validado com sucesso',
      userName: user.name,
      turno: user.turno
    });
  } catch (error) {
    logger.error('Error validating voucher:', error);
    throw error;
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
      return res.status(400).json({ error: 'Código do voucher deve conter 4 dígitos numéricos' });
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
      return res.status(401).json({ error: 'Voucher inválido ou expirado' });
    }

    const voucher = vouchers[0];
    
    if (voucher.meal_type_name !== mealType) {
      return res.status(400).json({ error: 'Tipo de refeição inválido para este voucher' });
    }

    await db.execute(
      'UPDATE disposable_vouchers SET is_used = TRUE, used_at = NOW() WHERE id = ?',
      [voucher.id]
    );

    res.json({ success: true, message: 'Voucher validado com sucesso' });
  } catch (error) {
    logger.error('Error validating disposable voucher:', error);
    throw error;
  } finally {
    if (db) db.release();
  }
};
