import { supabase } from '../config/database.js';
import logger from '../config/logger.js';
import { validateVoucherTime } from '../utils/voucherValidations.js';
import { isWithinShiftHours, getAllowedMealsByShift } from '../utils/shiftUtils.js';
import { VOUCHER_TYPES } from '../utils/voucherTypes.js';

const handleDisposableVoucher = async (code, mealType) => {
  const { data: disposableVoucher, error } = await supabase
    .from('disposable_vouchers')
    .select('*')
    .eq('code', code)
    .single();

  if (error || !disposableVoucher) {
    return null;
  }

  if (disposableVoucher.is_used) {
    throw new Error('Voucher Descartável já foi utilizado');
  }

  if (mealType.toLowerCase() === 'extra') {
    throw new Error('Voucher Descartável não disponível para uso Extra');
  }

  if (disposableVoucher.meal_type_id !== parseInt(mealType)) {
    throw new Error('Tipo de refeição não corresponde ao voucher descartável');
  }

  const { error: updateError } = await supabase
    .from('disposable_vouchers')
    .update({ 
      is_used: true, 
      used_at: new Date().toISOString() 
    })
    .eq('id', disposableVoucher.id);

  if (updateError) throw updateError;

  return { success: true, message: 'Voucher descartável validado com sucesso' };
};

const handleNormalVoucher = async (cpf, code, mealType, user) => {
  const { data: allowedMeals } = await supabase
    .from('shift_meal_types')
    .select('meal_type_id')
    .eq('shift', user.shift);
  
  if (!allowedMeals.some(meal => meal.meal_type_id === mealType)) {
    throw new Error(`${mealType} não está disponível para o turno ${user.shift}`);
  }

  return { success: true };
};

const handleExtraVoucher = async (cpf, code, mealType, user) => {
  const { data: extraVouchers, error } = await supabase
    .from('extra_vouchers')
    .select()
    .eq('user_id', user.id)
    .gte('valid_until', new Date().toISOString())
    .eq('used', false);

  if (error || extraVouchers.length === 0) {
    throw new Error('Limite diário de refeições atingido');
  }

  const { error: updateError } = await supabase
    .from('extra_vouchers')
    .update({ used: true })
    .eq('id', extraVouchers[0].id);

  if (updateError) throw updateError;

  return { success: true };
};

export const validateVoucher = async (req, res) => {
  const { cpf, voucherCode: code, mealType } = req.body;
  
  try {
    const cleanCpf = cpf ? cpf.replace(/[^\d]/g, '') : '';
    const cleanCode = code.toString().trim();

    logger.info(`Dados recebidos - CPF: ${cleanCpf}, Código: ${cleanCode}, Tipo: ${mealType}`);

    // Tenta validar como voucher descartável primeiro
    const disposableResult = await handleDisposableVoucher(cleanCode, mealType);
    if (disposableResult) {
      return res.json(disposableResult);
    }

    if (!cleanCpf) {
      return res.status(400).json({ 
        error: 'CPF é obrigatório para vouchers normais e extras'
      });
    }

    // Buscar usuário
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('cpf', cleanCpf)
      .eq('voucher', cleanCode)
      .eq('is_suspended', false);

    if (userError || users.length === 0) {
      logger.warn(`Usuário não encontrado - CPF: ${cleanCpf}, Voucher: ${cleanCode}`);
      return res.status(401).json({ 
        error: 'Usuário não encontrado ou voucher inválido',
        userName: null,
        turno: null 
      });
    }

    const user = users[0];

    // Verifica uso diário
    const { data: usedMeals } = await supabase
      .from('voucher_usage')
      .select('meal_types(name), used_at')
      .eq('user_id', user.id)
      .gte('used_at', new Date().toISOString().split('T')[0]);

    let result;
    if (usedMeals.length >= 2) {
      result = await handleExtraVoucher(cleanCpf, cleanCode, mealType, user);
    } else {
      result = await handleNormalVoucher(cleanCpf, cleanCode, mealType, user);
    }

    // Registra o uso do voucher
    const { error: usageError } = await supabase
      .from('voucher_usage')
      .insert([{
        user_id: user.id,
        meal_type_id: mealType,
        used_at: new Date().toISOString()
      }]);

    if (usageError) throw usageError;

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
  }
};