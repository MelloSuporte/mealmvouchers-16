import { supabase } from '../../../config/supabase';
import logger from '../../../config/logger';

export const identifyVoucherType = async (codigo) => {
  try {
    logger.info('Identificando tipo de voucher:', codigo);
    
    const voucherCode = String(codigo);
    
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('voucher')
      .eq('voucher', voucherCode)
      .single();

    if (usuario) {
      logger.info('Voucher identificado como comum');
      return 'comum';
    }

    const { data: voucherExtra } = await supabase
      .from('vouchers_extras')
      .select('*')
      .eq('codigo', voucherCode)
      .single();

    if (voucherExtra) {
      logger.info('Voucher identificado como extra');
      return 'extra';
    }

    const { data: voucherDescartavel } = await supabase
      .from('vouchers_descartaveis')
      .select('*')
      .eq('codigo', voucherCode)
      .single();

    if (voucherDescartavel) {
      logger.info('Voucher identificado como descartável');
      return 'descartavel';
    }

    logger.info('Tipo de voucher não identificado');
    return null;
  } catch (error) {
    logger.error('Erro ao identificar tipo de voucher:', error);
    return null;
  }
};