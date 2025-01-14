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

    // Mark voucher as used directly in vouchers_descartaveis table
    const currentDate = new Date().toISOString();
    
    const { error: updateError } = await supabase
      .from('vouchers_descartaveis')
      .update({ usado_em: currentDate })
      .eq('id', voucherDescartavel.id)
      .filter('usado_em', 'is', null)
      .single();

    if (updateError) {
      logger.error('Erro ao marcar voucher como usado:', updateError);
      return {
        success: false,
        error: 'Erro ao marcar voucher como usado',
        voucherType: 'descartavel'
      };
    }

    logger.info('Voucher marcado como usado com sucesso:', {
      id: voucherDescartavel.id,
      codigo: voucherDescartavel.codigo,
      usado_em: currentDate
    });

    return {
      success: true,
      voucherType: 'descartavel',
      message: 'Voucher validado com sucesso'
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