import { supabase } from '../../../config/supabase';
import logger from '../../../config/logger';

export const identifyVoucherType = async (codigo: string) => {
  try {
    const voucherCode = String(codigo);
    
    // Verificar voucher descartável
    const { data: voucherDescartavel, error: errorDescartavel } = await supabase
      .from('vouchers_descartaveis')
      .select('id')
      .eq('codigo', voucherCode)
      .is('usado_em', null)
      .is('data_uso', null)
      .gte('data_expiracao', new Date().toISOString())
      .maybeSingle();

    if (errorDescartavel) {
      logger.error('Erro ao buscar voucher descartável:', errorDescartavel);
    } else if (voucherDescartavel) {
      logger.info('Voucher identificado como descartável');
      return 'descartavel';
    }

    // Verificar voucher comum
    const { data: usuario, error: errorUsuario } = await supabase
      .from('usuarios')
      .select('id')
      .eq('voucher', voucherCode)
      .maybeSingle();

    if (errorUsuario) {
      logger.error('Erro ao buscar voucher comum:', errorUsuario);
    } else if (usuario) {
      logger.info('Voucher identificado como comum');
      return 'comum';
    }

    // Verificar voucher extra
    const { data: voucherExtra, error: errorExtra } = await supabase
      .from('vouchers_extras')
      .select('id')
      .eq('codigo', voucherCode)
      .maybeSingle();

    if (errorExtra) {
      logger.error('Erro ao buscar voucher extra:', errorExtra);
    } else if (voucherExtra) {
      logger.info('Voucher identificado como extra');
      return 'extra';
    }

    logger.info('Tipo de voucher não identificado');
    return null;
  } catch (error) {
    logger.error('Erro ao identificar tipo de voucher:', error);
    return null;
  }
};