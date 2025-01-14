import { supabase } from '../../../config/supabase';
import logger from '../../../config/logger';

export const validateAndUseDisposableVoucher = async (voucherDescartavel, tipoRefeicaoId) => {
  try {
    // Validate meal type
    if (voucherDescartavel.tipo_refeicao_id !== tipoRefeicaoId) {
      return {
        success: false,
        error: 'Tipo de refeição não corresponde ao voucher descartável',
        voucherType: 'descartavel'
      };
    }

    // Register usage in uso_voucher table
    const { error: usageError } = await supabase
      .from('uso_voucher')
      .insert({
        voucher_descartavel_id: voucherDescartavel.id,
        tipo_refeicao_id: tipoRefeicaoId,
        tipo_voucher: 'descartavel',
        usado_em: new Date().toISOString()
      });

    if (usageError) {
      logger.error('Erro ao registrar uso do voucher:', usageError);
      return {
        success: false,
        error: 'Erro ao registrar uso do voucher',
        voucherType: 'descartavel'
      };
    }

    // Mark voucher as used
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