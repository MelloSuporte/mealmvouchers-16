import { supabase } from '../../../config/supabase';
import logger from '../../../config/logger';

export const identifyVoucherType = async (codigo) => {
  try {
    logger.info('Identificando tipo de voucher:', codigo);
    
    // First check if it's a disposable voucher
    const { data: disposableVoucher } = await supabase
      .from('vouchers_descartaveis')
      .select('*')
      .eq('codigo', codigo)
      .maybeSingle();

    if (disposableVoucher) {
      logger.info('Voucher identificado como descartável');
      return 'descartavel';
    }

    // Then check if it's a common voucher
    const { data: commonVoucher } = await supabase
      .from('usuarios')
      .select('voucher')
      .eq('voucher', codigo)
      .maybeSingle();

    if (commonVoucher) {
      logger.info('Voucher identificado como comum');
      return 'comum';
    }

    logger.warn('Tipo de voucher não identificado');
    return null;
  } catch (error) {
    logger.error('Erro ao identificar tipo de voucher:', error);
    return null;
  }
};