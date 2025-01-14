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
    const { data: mealType, error: mealTypeError } = await supabase
      .from('tipos_refeicao')
      .select('*')
      .eq('id', tipoRefeicaoId)
      .single();

    if (mealTypeError || !mealType) {
      logger.error('Erro ao validar tipo de refeição:', mealTypeError);
      return {
        success: false,
        error: 'Tipo de refeição inválido',
        voucherType: 'descartavel'
      };
    }

    // Validate if voucher matches meal type
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

    // Mark voucher as used first
    const timestamp = new Date().toISOString();
    const { error: updateError } = await supabase
      .from('vouchers_descartaveis')
      .update({ 
        usado_em: timestamp,
        data_uso: timestamp 
      })
      .eq('id', voucherDescartavel.id)
      .eq('usado_em', null);

    if (updateError) {
      logger.error('Erro ao marcar voucher como usado:', updateError);
      return {
        success: false,
        error: 'Erro ao marcar voucher como usado',
        voucherType: 'descartavel'
      };
    }

    // Then register usage
    const { error: usageError } = await supabase
      .from('uso_voucher')
      .insert({
        voucher_descartavel_id: voucherDescartavel.id,
        tipo_refeicao_id: tipoRefeicaoId,
        tipo_voucher: 'descartavel',
        usado_em: timestamp
      });

    if (usageError) {
      logger.error('Erro ao registrar uso do voucher:', usageError);
      // Rollback voucher status if usage registration fails
      await supabase
        .from('vouchers_descartaveis')
        .update({ 
          usado_em: null,
          data_uso: null 
        })
        .eq('id', voucherDescartavel.id);
        
      return {
        success: false,
        error: 'Erro ao registrar uso do voucher',
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