import { supabase } from '../../../config/supabase';
import logger from '../../../config/logger';

export const validateAndUseDisposableVoucher = async (voucher, tipoRefeicaoId) => {
  try {
    logger.info('Validando voucher descartável:', voucher);

    // Atualizar o voucher como usado
    const { data: updatedVoucher, error: updateError } = await supabase
      .from('vouchers_descartaveis')
      .update({
        usado_em: new Date().toISOString(),
        data_uso: new Date().toISOString()
      })
      .eq('id', voucher.id)
      .is('usado_em', null)
      .select()
      .single();

    if (updateError) {
      logger.error('Erro ao atualizar voucher descartável:', updateError);
      throw updateError;
    }

    if (!updatedVoucher) {
      throw new Error('Voucher já utilizado ou não encontrado');
    }

    logger.info('Voucher descartável validado com sucesso:', updatedVoucher);
    return {
      success: true,
      message: 'Voucher validado com sucesso',
      voucher: updatedVoucher
    };

  } catch (error) {
    logger.error('Erro ao validar voucher descartável:', error);
    return { 
      success: false, 
      error: error.message || 'Erro ao validar voucher descartável',
      voucherType: 'descartavel'
    };
  }
};