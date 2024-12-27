import { supabase } from '../../config/supabase';
import logger from '../../config/logger';

export const registerVoucherUsage = async (userId, tipoRefeicaoId, tipoVoucher, voucherId) => {
  try {
    // Primeiro, inserir o uso do voucher
    const { data, error } = await supabase
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
      .maybeSingle();

    if (error) {
      logger.error('Erro ao registrar uso:', error);
      throw error;
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

    return data;
  } catch (error) {
    logger.error('Erro ao registrar uso do voucher:', error);
    throw error;
  }
};

export const getLastVoucherUsage = async (userId) => {
  try {
    logger.info('Buscando último uso do voucher para usuário:', userId);
    
    const { data, error } = await supabase
      .from('uso_voucher')
      .select('usado_em')
      .eq('usuario_id', userId)
      .order('usado_em', { ascending: false })
      .limit(1);

    if (error) {
      logger.error('Erro ao buscar último uso:', error);
      throw error;
    }

    // Return null if no records found, otherwise return the first record
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    logger.error('Erro ao buscar último uso do voucher:', error);
    return null;
  }
};