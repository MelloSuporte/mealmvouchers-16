import { supabase } from '../../../config/supabase';
import logger from '../../../config/logger';

export const identifyVoucherType = async (code) => {
  try {
    // Verificar se é um voucher comum (usuário)
    const { data: user } = await supabase
      .from('usuarios')
      .select('voucher')
      .eq('voucher', code)
      .single();

    if (user) {
      return 'comum';
    }

    // Verificar se é um voucher descartável
    const { data: disposable } = await supabase
      .from('vouchers_descartaveis')
      .select('id')
      .eq('codigo', code)
      .single();

    if (disposable) {
      return 'descartavel';
    }

    return null;
  } catch (error) {
    logger.error('Erro ao identificar tipo do voucher:', error);
    throw error;
  }
};