import { supabase } from '../../config/supabase';
import logger from '../../config/logger';

export const registerVoucherUsage = async (
  userId,
  tipoRefeicaoId,
  tipoVoucher,
  voucherDescartavelId = null
) => {
  try {
    const { data, error } = await supabase
      .from('uso_voucher')
      .insert({
        usuario_id: userId,
        tipo_refeicao_id: tipoRefeicaoId,
        tipo_voucher: tipoVoucher,
        voucher_descartavel_id: voucherDescartavelId,
        usado_em: new Date().toISOString()
      })
      .select()
      .maybeSingle();

    if (error) {
      logger.error('Erro ao registrar uso do voucher:', error);
      return { success: false, error: 'Erro ao registrar uso do voucher' };
    }

    return { success: true, data };
  } catch (error) {
    logger.error('Erro ao registrar uso do voucher:', error);
    return { success: false, error: 'Erro ao registrar uso do voucher' };
  }
};