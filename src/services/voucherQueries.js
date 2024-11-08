import { supabase } from '../config/supabase';
import logger from '../config/logger';

export const findValidVoucher = async (code) => {
  const { data, error } = await supabase
    .from('disposable_vouchers')
    .select(`
      *,
      meal_types (
        name,
        start_time,
        end_time,
        tolerance_minutes
      )
    `)
    .eq('code', code)
    .eq('is_used', false)
    .gte('expired_at', new Date().toISOString())
    .single();

  if (error) {
    logger.warn(`Tentativa de uso de voucher inválido ou expirado: ${code}`);
    throw new Error('Voucher inválido, já utilizado ou expirado');
  }

  return data;
};

export const findActiveMealType = async (mealType) => {
  const { data, error } = await supabase
    .from('meal_types')
    .select('id, name, start_time, end_time')
    .eq('name', mealType)
    .eq('is_active', true)
    .single();

  if (error) {
    logger.warn(`Tipo de refeição inválido ou inativo: ${mealType}`);
    throw new Error('Tipo de refeição inválido ou inativo');
  }

  return data;
};

export const markVoucherAsUsed = async (voucherId) => {
  const { error } = await supabase
    .from('disposable_vouchers')
    .update({ 
      is_used: true, 
      used_at: new Date().toISOString() 
    })
    .eq('id', voucherId);

  if (error) throw error;
};