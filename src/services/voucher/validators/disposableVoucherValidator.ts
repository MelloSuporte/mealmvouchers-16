import { supabase } from '../../../config/supabase';
import logger from '../../../config/logger';
import { logSystemEvent, LOG_TYPES } from '../../../utils/systemLogs';

export const validateDisposableVoucher = async (codigo: string, tipoRefeicaoId: string) => {
  try {
    const { data: voucher, error } = await supabase
      .from('vouchers_descartaveis')
      .select('*')
      .eq('codigo', String(codigo))
      .is('usado_em', null)
      .single();

    if (error || !voucher) {
      return { success: false, error: 'Voucher descartável inválido ou já utilizado' };
    }

    // Registrar uso do voucher
    const { error: usageError } = await supabase
      .from('uso_voucher')
      .insert({
        tipo_refeicao_id: tipoRefeicaoId,
        usado_em: new Date().toISOString(),
        tipo_voucher: 'descartavel',
        voucher_descartavel_id: voucher.id
      });

    if (usageError) {
      logger.error('Erro ao registrar uso do voucher descartável:', usageError);
      throw usageError;
    }

    // Marcar voucher descartável como usado
    const { error: updateError } = await supabase
      .from('vouchers_descartaveis')
      .update({ usado_em: new Date().toISOString() })
      .eq('id', voucher.id);

    if (updateError) {
      logger.error('Erro ao atualizar status do voucher descartável:', updateError);
      throw updateError;
    }

    await logSystemEvent({
      tipo: LOG_TYPES.USO_VOUCHER,
      mensagem: 'Voucher descartável utilizado com sucesso',
      detalhes: { voucherId: voucher.id, tipoRefeicaoId }
    });

    return { success: true, voucher };
  } catch (error) {
    logger.error('Erro ao validar voucher descartável:', error);
    throw error;
  }
};