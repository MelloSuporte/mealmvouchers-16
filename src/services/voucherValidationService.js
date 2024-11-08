import { supabase } from '../config/database.js';
import logger from '../config/logger.js';

export const validateVoucherCode = async (code) => {
  if (!code) {
    throw new Error('Código do voucher é obrigatório');
  }

  const { data: vouchers, error } = await supabase
    .from('disposable_vouchers')
    .select(`
      *,
      meal_types (
        name
      )
    `)
    .eq('code', code)
    .eq('is_used', false);

  if (error || vouchers.length === 0) {
    return { exists: false, message: 'Voucher não encontrado ou já utilizado' };
  }

  return { 
    exists: true, 
    voucher: vouchers[0],
    message: 'Voucher válido'
  };
};

export const validateMealType = async (mealTypeId) => {
  const { data: mealTypes, error } = await supabase
    .from('meal_types')
    .select()
    .eq('id', mealTypeId)
    .eq('is_active', true);

  if (error || mealTypes.length === 0) {
    throw new Error('Tipo de refeição inválido ou inativo');
  }

  return mealTypes[0];
};

export const validateExistingVoucher = async (code, mealTypeId) => {
  const { data: vouchers, error } = await supabase
    .from('disposable_vouchers')
    .select(`
      *,
      meal_types (
        name,
        start_time,
        end_time
      )
    `)
    .eq('code', code)
    .eq('is_used', false);

  if (error || vouchers.length === 0) {
    throw new Error('Voucher não encontrado ou já utilizado');
  }

  const voucher = vouchers[0];

  if (voucher.meal_type_id !== parseInt(mealTypeId)) {
    throw new Error('Tipo de refeição não corresponde ao voucher');
  }

  if (voucher.expired_at) {
    const expirationDate = new Date(voucher.expired_at);
    if (expirationDate < new Date()) {
      throw new Error('Voucher expirado');
    }
  }

  return voucher;
};