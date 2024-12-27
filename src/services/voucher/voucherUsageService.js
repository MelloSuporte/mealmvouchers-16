import { supabase } from '../../config/supabase';
import logger from '../../config/logger';
import { logSystemEvent, LOG_TYPES } from '../../utils/systemLogs';

export const registerVoucherUsage = async (userId, tipoRefeicaoId, tipoVoucher, voucherId) => {
  try {
    // Primeiro, inserir o uso do voucher
    const { data: usageData, error: usageError } = await supabase
      .from('uso_voucher')
      .insert({
        usuario_id: userId,
        tipo_refeicao_id: tipoRefeicaoId,
        tipo_voucher: tipoVoucher,
        voucher_extra_id: tipoVoucher === 'extra' ? voucherId : null,
        voucher_descartavel_id: tipoVoucher === 'descartavel' ? voucherId : null,
        usado_em: new Date().toISOString()
      })
      .select('*')
      .single();

    if (usageError) {
      logger.error('Erro ao registrar uso:', usageError);
      throw usageError;
    }

    // Atualizar status do voucher específico em uma transação separada
    if (tipoVoucher === 'extra' && voucherId) {
      const { error: updateError } = await supabase
        .from('vouchers_extras')
        .update({ usado_em: new Date().toISOString() })
        .eq('id', voucherId);

      if (updateError) throw updateError;
    } else if (tipoVoucher === 'descartavel' && voucherId) {
      const { error: updateError } = await supabase
        .from('vouchers_descartaveis')
        .update({ usado_em: new Date().toISOString() })
        .eq('id', voucherId);

      if (updateError) throw updateError;
    }

    await logSystemEvent({
      tipo: LOG_TYPES.USO_VOUCHER,
      mensagem: 'Voucher utilizado com sucesso',
      detalhes: { userId, tipoRefeicaoId, tipoVoucher, voucherId }
    });

    return usageData;
  } catch (error) {
    logger.error('Erro ao registrar uso do voucher:', error);
    throw error;
  }
};

export const getLastVoucherUsage = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('uso_voucher')
      .select('usado_em')
      .eq('usuario_id', userId)
      .order('usado_em', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    logger.error('Erro ao buscar último uso do voucher:', error);
    return null;
  }
};