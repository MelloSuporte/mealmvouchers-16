import { supabase } from '../../../config/supabase';
import logger from '../../../config/logger';
import { logSystemEvent, LOG_TYPES } from '../../../utils/systemLogs';

export const validateExtraVoucher = async (codigo: string, tipoRefeicaoId: string) => {
  try {
    const { data: voucher, error } = await supabase
      .from('vouchers_extras')
      .select('*, usuarios(*)')
      .eq('codigo', String(codigo))
      .is('usado_em', null)
      .single();

    if (error || !voucher) {
      return { success: false, error: 'Voucher extra inválido ou já utilizado' };
    }

    // Registrar uso do voucher
    const { data: usoVoucher, error: usageError } = await supabase
      .from('uso_voucher')
      .insert({
        usuario_id: voucher.usuario_id,
        tipo_refeicao_id: tipoRefeicaoId,
        usado_em: new Date().toISOString(),
        tipo_voucher: 'extra',
        voucher_extra_id: voucher.id
      })
      .select()
      .single();

    if (usageError) {
      logger.error('Erro ao registrar uso do voucher extra:', usageError);
      throw usageError;
    }

    // Marcar voucher extra como usado
    const { error: updateError } = await supabase
      .from('vouchers_extras')
      .update({ usado_em: new Date().toISOString() })
      .eq('id', voucher.id);

    if (updateError) {
      logger.error('Erro ao atualizar status do voucher extra:', updateError);
      throw updateError;
    }

    await logSystemEvent({
      tipo: LOG_TYPES.USO_VOUCHER,
      mensagem: 'Voucher extra utilizado com sucesso',
      detalhes: { voucherId: voucher.id, tipoRefeicaoId }
    });

    return { 
      success: true, 
      voucher,
      usoVoucherId: usoVoucher.id 
    };
  } catch (error) {
    logger.error('Erro ao validar voucher extra:', error);
    throw error;
  }
};