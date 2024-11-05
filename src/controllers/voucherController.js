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
    
    // Remover caracteres especiais do CPF antes da consulta
    const cleanCpf = cpf.replace(/[^\d]/g, '');
    const cleanCode = code.toString().trim();

    // Log para debug dos dados recebidos e limpos
    logger.info(`Dados recebidos - CPF original: ${cpf}, CPF limpo: ${cleanCpf}`);
    logger.info(`Dados recebidos - Voucher original: ${code}, Voucher limpo: ${cleanCode}`);
    
    // Consulta SQL melhorada com LOGGING
    const [users] = await db.execute(
      'SELECT * FROM users WHERE cpf = ? AND voucher = ? AND is_suspended = FALSE',
      [cleanCpf, cleanCode]
    );

    // Log do resultado da consulta
    logger.info(`Resultado da consulta: ${users.length} usuários encontrados`);

    if (users.length === 0) {
      // Verificar separadamente para identificar o problema específico
      const [userCheck] = await db.execute(
        'SELECT id, name, cpf, voucher FROM users WHERE cpf = ?', 
        [cleanCpf]
      );
      
      const [voucherCheck] = await db.execute(
        'SELECT id, name, cpf, voucher FROM users WHERE voucher = ?', 
        [cleanCode]
      );
      
      logger.warn(`Validação detalhada:`);
      logger.warn(`CPF check (${cleanCpf}): ${JSON.stringify(userCheck)}`);
      logger.warn(`Voucher check (${cleanCode}): ${JSON.stringify(voucherCheck)}`);
      
      return res.status(401).json({ 
        error: 'Usuário não encontrado ou voucher inválido',
        userName: null,
        turno: null 
      });
    }

    const user = users[0];

    // Validação específica para voucher normal
    validateVoucherByType(VOUCHER_TYPES.NORMAL, { 
      code, 
      cpf, 
      mealType,
      user 
    });

    // Get today's meal usage
    const [usedMeals] = await db.execute(
      `SELECT mt.name, vu.used_at
       FROM voucher_usage vu 
       JOIN meal_types mt ON vu.meal_type_id = mt.id 
       WHERE vu.user_id = ? 
       AND DATE(vu.used_at) = CURDATE()`,
      [user.id]
    );

    const allowedMeals = getAllowedMealsByShift(user.turno);
    
    if (!allowedMeals.includes(mealType)) {
      logger.warn(`Tipo de refeição inválido - Usuário: ${user.name}, Refeição: ${mealType}`);
      return res.status(403).json({
        error: `${mealType} não está disponível para o ${user.turno} turno`,
        userName: user.name,
        turno: user.turno
      });
    }

    // Verifica se o tipo de refeição está ativo e dentro do horário
    const [mealTypeInfo] = await db.execute(
      'SELECT * FROM meal_types WHERE name = ? AND is_active = TRUE',
      [mealType]
    );

    if (mealTypeInfo.length === 0) {
      return res.status(400).json({
        error: 'Tipo de refeição inválido ou inativo',
        userName: user.name,
        turno: user.turno
      });
    }

    const currentMealType = mealTypeInfo[0];
    const toleranceMinutes = currentMealType.tolerance_minutes || 15;

    // Get current time in HH:mm format
    const [timeResult] = await db.execute('SELECT TIME_FORMAT(NOW(), "%H:%i") as current_time');
    const currentTime = timeResult[0].current_time;
    
    if (usedMeals.length >= 2) {
      // Check if this is an extra voucher request
      const [extraVoucher] = await db.execute(
        'SELECT * FROM extra_vouchers WHERE user_id = ? AND valid_until >= CURDATE() AND used = FALSE',
        [user.id]
      );

      if (extraVoucher.length === 0) {
        logger.warn(`Limite diário excedido - Usuário: ${user.name}`);
        return res.status(403).json({
          error: 'Limite diário de refeições atingido',
          userName: user.name,
          turno: user.turno
        });
      }

      // Marca o voucher extra como usado
      await db.execute(
        'UPDATE extra_vouchers SET used = TRUE WHERE id = ?',
        [extraVoucher[0].id]
      );
    }

    // Record the meal usage
    await db.execute(
      'INSERT INTO voucher_usage (user_id, meal_type_id, used_at) VALUES (?, (SELECT id FROM meal_types WHERE name = ?), NOW())',
      [user.id, mealType]
    );

    logger.info(`Voucher validado com sucesso - Usuário: ${user.name}, Refeição: ${mealType}`);
    return res.json({ 
      success: true, 
      message: 'Voucher validado com sucesso',
      userName: user.name,
      turno: user.turno
    });
  } catch (error) {
    logger.error('Erro ao validar voucher:', error);
    return res.status(400).json({ 
      error: error.message || 'Erro ao validar voucher. Tente novamente.'
    });
  } finally {
    if (db) db.release();
  }
};