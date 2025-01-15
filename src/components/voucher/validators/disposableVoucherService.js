import { supabase } from '../../../config/supabase';
import logger from '../../../config/logger';

export const validateAndUseDisposableVoucher = async (voucherDescartavel, tipoRefeicaoId) => {
  try {
    logger.info('Validando voucher descartável:', {
      voucherId: voucherDescartavel.id,
      tipoRefeicaoId
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

    // Mark voucher as used
    const { error: updateError } = await supabase
      .from('vouchers_descartaveis')
      .update({ 
        usado_em: new Date().toISOString(),
        usado: true
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

    // Store data for confirmation page
    localStorage.setItem('disposableVoucher', JSON.stringify({
      code: voucherDescartavel.codigo,
      mealType: mealType
    }));

    logger.info('Voucher descartável validado e registrado com sucesso');
    return {
      success: true,
      voucherType: 'descartavel',
      message: 'Voucher descartável validado com sucesso',
      shouldNavigate: true
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