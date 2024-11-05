import pool from '../config/database';
import logger from '../config/logger';
import { validateVoucherTime, validateVoucherByType } from '../utils/voucherValidations';
import { isWithinShiftHours, getAllowedMealsByShift } from '../utils/shiftUtils';
import { VOUCHER_TYPES } from '../utils/voucherTypes';

const handleDisposableVoucher = async (db, cleanCode, mealType) => {
  const [disposableVoucher] = await db.execute(
    'SELECT * FROM disposable_vouchers WHERE code = ?',
    [cleanCode]
  );

  if (disposableVoucher.length === 0) {
    return null;
  }

  // Verifica se já foi usado
  if (disposableVoucher[0].is_used) {
    throw new Error('Voucher Descartável já foi utilizado');
  }

  // Validação específica para voucher descartável
  validateVoucherByType(VOUCHER_TYPES.DISPOSABLE, { 
    code: cleanCode, 
    mealType 
  });

  // Verifica se o tipo de refeição corresponde
  if (disposableVoucher[0].meal_type_id !== parseInt(mealType)) {
    throw new Error('Tipo de refeição não corresponde ao voucher descartável');
  }

  // Marca voucher como usado
  await db.execute(
    'UPDATE disposable_vouchers SET is_used = TRUE, used_at = NOW() WHERE id = ?',
    [disposableVoucher[0].id]
  );

  return { success: true, message: 'Voucher descartável validado com sucesso' };
};

const handleNormalVoucher = async (db, cleanCpf, cleanCode, mealType, user) => {
  validateVoucherByType(VOUCHER_TYPES.NORMAL, { 
    code: cleanCode, 
    cpf: cleanCpf, 
    mealType,
    user 
  });

  const allowedMeals = getAllowedMealsByShift(user.turno);
  
  if (!allowedMeals.includes(mealType)) {
    throw new Error(`${mealType} não está disponível para o ${user.turno} turno`);
  }

  return { success: true };
};

const handleExtraVoucher = async (db, cleanCpf, cleanCode, mealType, user) => {
  const [extraVouchers] = await db.execute(
    'SELECT * FROM extra_vouchers WHERE user_id = ? AND valid_until >= CURDATE() AND used = FALSE',
    [user.id]
  );

  if (extraVouchers.length === 0) {
    throw new Error('Limite diário de refeições atingido');
  }

  validateVoucherByType(VOUCHER_TYPES.EXTRA, { 
    code: cleanCode, 
    cpf: cleanCpf, 
    mealType,
    user 
  });

  await db.execute(
    'UPDATE extra_vouchers SET used = TRUE WHERE id = ?',
    [extraVouchers[0].id]
  );

  return { success: true };
};

export const validateVoucher = async (req, res) => {
  const { cpf, voucherCode: code, mealType } = req.body;
  let db;
  
  try {
    db = await pool.getConnection();
    
    const cleanCpf = cpf ? cpf.replace(/[^\d]/g, '') : '';
    const cleanCode = code.toString().trim();

    logger.info(`Dados recebidos - CPF: ${cleanCpf}, Código: ${cleanCode}, Tipo: ${mealType}`);

    // Tenta validar como voucher descartável primeiro
    const disposableResult = await handleDisposableVoucher(db, cleanCode, mealType);
    if (disposableResult) {
      return res.json(disposableResult);
    }

    if (!cleanCpf) {
      return res.status(400).json({ 
        error: 'CPF é obrigatório para vouchers normais e extras'
      });
    }

    // Buscar usuário
    const [users] = await db.execute(
      'SELECT * FROM users WHERE cpf = ? AND voucher = ? AND is_suspended = FALSE',
      [cleanCpf, cleanCode]
    );

    if (users.length === 0) {
      logger.warn(`Usuário não encontrado - CPF: ${cleanCpf}, Voucher: ${cleanCode}`);
      return res.status(401).json({ 
        error: 'Usuário não encontrado ou voucher inválido',
        userName: null,
        turno: null 
      });
    }

    const user = users[0];

    // Verifica uso diário
    const [usedMeals] = await db.execute(
      `SELECT mt.name, vu.used_at
       FROM voucher_usage vu 
       JOIN meal_types mt ON vu.meal_type_id = mt.id 
       WHERE vu.user_id = ? 
       AND DATE(vu.used_at) = CURDATE()`,
      [user.id]
    );

    let result;
    if (usedMeals.length >= 2) {
      // Se já usou 2 ou mais refeições, tenta validar como voucher extra
      result = await handleExtraVoucher(db, cleanCpf, cleanCode, mealType, user);
    } else {
      // Caso contrário, valida como voucher normal
      result = await handleNormalVoucher(db, cleanCpf, cleanCode, mealType, user);
    }

    // Registra o uso do voucher
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
