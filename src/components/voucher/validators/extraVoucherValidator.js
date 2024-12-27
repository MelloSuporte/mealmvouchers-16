import { supabase } from '../../../config/supabase';
import logger from '../../../config/logger';

export const validateExtraVoucher = async (codigo) => {
  try {
    const { data: voucher, error } = await supabase
      .from('vouchers_extras')
      .select('*, usuarios(*)')
      .eq('codigo', String(codigo))
      .single();

    if (error || !voucher) {
      return { success: false, error: 'Voucher extra inválido' };
    }

    // Verificar se já foi usado
    if (voucher.usado) {
      return { success: false, error: 'Voucher extra já utilizado' };
    }

    // Verificar validade
    if (new Date(voucher.valido_ate) < new Date()) {
      return { success: false, error: 'Voucher extra expirado' };
    }

    return { success: true, voucher };
  } catch (error) {
    logger.error('Erro ao validar voucher extra:', error);
    throw error;
  }
};