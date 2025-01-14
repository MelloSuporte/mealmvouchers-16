import { supabase } from '../../../config/supabase';
import logger from '../../../config/logger';

export const validateAndUseDisposableVoucher = async (voucherDescartavel, tipoRefeicaoId) => {
  try {
    logger.info('Validando voucher descartável:', {
      voucherId: voucherDescartavel.id,
      tipoRefeicaoId: tipoRefeicaoId,
      voucherTipoRefeicaoId: voucherDescartavel.tipo_refeicao_id
    });

    // Validate meal type
    if (voucherDescartavel.tipo_refeicao_id !== tipoRefeicaoId) {
      logger.error('Tipo de refeição não corresponde:', {
        voucherTipo: voucherDescartavel.tipo_refeicao_id,
        solicitadoTipo: tipoRefeicaoId
      });
      return {
        success: false,
        error: 'Tipo de refeição não corresponde ao voucher descartável',
        voucherType: 'descartavel'
      };
    }

    // Mark voucher as used directly in vouchers_descartaveis table
    const { error: updateError } = await supabase
      .from('vouchers_descartaveis')
      .update({ 
        usado_em: new Date().toISOString(),
        data_uso: new Date().toISOString()
      })
      .eq('id', voucherDescartavel.id)
      .is('usado_em', null);

    if (updateError) {
      logger.error('Erro ao marcar voucher como usado:', updateError);
      return {
        success: false,
        error: 'Erro ao marcar voucher como usado',
        voucherType: 'descartavel'
      };
    }

    logger.info('Voucher descartável validado e registrado com sucesso');
    return {
      success: true,
      voucherType: 'descartavel',
      message: 'Voucher descartável validado com sucesso'
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