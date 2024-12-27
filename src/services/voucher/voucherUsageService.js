import { supabase } from '../../config/supabase';
import logger from '../../config/logger';
import { logSystemEvent, LOG_TYPES } from '../../utils/systemLogs';

export const registerVoucherUsage = async (userId, tipoRefeicaoId, tipoVoucher, voucherId) => {
  try {
    const { error: usageError } = await supabase
      .from('uso_voucher')
      .insert({
        usuario_id: userId,
        tipo_refeicao_id: tipoRefeicaoId,
        tipo_voucher: tipoVoucher,
        voucher_extra_id: tipoVoucher === 'extra' ? voucherId : null,
        voucher_descartavel_id: tipoVoucher === 'descartavel' ? voucherId : null,
        usado_em: new Date().toISOString()
      });

    if (usageError) {
      logger.error('Erro ao registrar uso:', usageError);
      throw usageError;
    }

    // Atualizar status do voucher
    if (tipoVoucher === 'extra') {
      await supabase
        .from('vouchers_extras')
        .update({ usado_em: new Date().toISOString() })
        .eq('id', voucherId);
    } else if (tipoVoucher === 'descartavel') {
      await supabase
        .from('vouchers_descartaveis')
        .update({ usado_em: new Date().toISOString() })
        .eq('id', voucherId);
    }

    await logSystemEvent({
      tipo: LOG_TYPES.USO_VOUCHER,
      mensagem: 'Voucher utilizado com sucesso',
      detalhes: { userId, tipoRefeicaoId, tipoVoucher, voucherId }
    });

    return true;
  } catch (error) {
    logger.error('Erro ao registrar uso do voucher:', error);
    throw error;
  }
};