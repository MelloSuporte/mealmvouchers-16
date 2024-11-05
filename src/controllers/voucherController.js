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
    const cleanCpf = cpf ? cpf.replace(/[^\d]/g, '') : '';
    const cleanCode = code.toString().trim();

    // Log para debug dos dados recebidos e limpos
    logger.info(`Dados recebidos - CPF: ${cleanCpf}, Código: ${cleanCode}, Tipo: ${mealType}`);

    // Primeiro, verificar se é um voucher descartável
    const [disposableVoucher] = await db.execute(
      'SELECT * FROM disposable_vouchers WHERE code = ? AND is_used = FALSE',
      [cleanCode]
    );

    if (disposableVoucher.length > 0) {
      // Validação específica para voucher descartável
      validateVoucherByType(VOUCHER_TYPES.DISPOSABLE, { 
        code: cleanCode, 
        mealType 
      });

      // Verificar se o tipo de refeição corresponde
      if (disposableVoucher[0].meal_type_id !== parseInt(mealType)) {
        return res.status(400).json({ 
          error: 'Tipo de refeição não corresponde ao voucher descartável'
        });
      }

      // Marcar voucher como usado
      await db.execute(
        'UPDATE disposable_vouchers SET is_used = TRUE, used_at = NOW() WHERE id = ?',
        [disposableVoucher[0].id]
      );

      return res.json({ 
        success: true, 
        message: 'Voucher descartável validado com sucesso'
      });
    }

    // Se não for descartável, precisa ter CPF
    if (!cleanCpf) {
      return res.status(400).json({ 
        error: 'CPF é obrigatório para vouchers normais e extras'
      });
    }

    // Buscar usuário com CPF e voucher correspondentes
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

    // Verificar se existe voucher extra para o usuário
    const [extraVouchers] = await db.execute(
      'SELECT * FROM extra_vouchers WHERE user_id = ? AND valid_until >= CURDATE() AND used = FALSE',
      [user.id]
    );

    // Get today's meal usage
    const [usedMeals] = await db.execute(
      `SELECT mt.name, vu.used_at
       FROM voucher_usage vu 
       JOIN meal_types mt ON vu.meal_type_id = mt.id 
       WHERE vu.user_id = ? 
       AND DATE(vu.used_at) = CURDATE()`,
      [user.id]
    );

    // Se já usou 2 ou mais refeições, precisa ter voucher extra
    if (usedMeals.length >= 2) {
      if (extraVouchers.length === 0) {
        logger.warn(`Limite diário excedido sem voucher extra - Usuário: ${user.name}`);
        return res.status(403).json({
          error: 'Limite diário de refeições atingido',
          userName: user.name,
          turno: user.turno
        });
      }

      // Validação específica para voucher extra
      validateVoucherByType(VOUCHER_TYPES.EXTRA, { 
        code: cleanCode, 
        cpf: cleanCpf, 
        mealType,
        user 
      });

      // Marca o voucher extra como usado
      await db.execute(
        'UPDATE extra_vouchers SET used = TRUE WHERE id = ?',
        [extraVouchers[0].id]
      );
    } else {
      // Validação específica para voucher normal
      validateVoucherByType(VOUCHER_TYPES.NORMAL, { 
        code: cleanCode, 
        cpf: cleanCpf, 
        mealType,
        user 
      });
    }

    const allowedMeals = getAllowedMealsByShift(user.turno);
    
    if (!allowedMeals.includes(mealType)) {
      logger.warn(`Tipo de refeição inválido - Usuário: ${user.name}, Refeição: ${mealType}`);
      return res.status(403).json({
        error: `${mealType} não está disponível para o ${user.turno} turno`,
        userName: user.name,
        turno: user.turno
      });
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