import { supabase } from '../../../config/supabase';
import logger from '../../../config/logger';
import { formatInTimeZone } from 'date-fns-tz';

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

    // Verificar se o voucher já não foi usado
    const { data: voucherAtual, error: checkError } = await supabase
      .from('vouchers_descartaveis')
      .select('*')
      .eq('id', voucherDescartavel.id)
      .is('usado_em', null)
      .single();

    if (checkError || !voucherAtual) {
      logger.error('Voucher já utilizado ou não encontrado:', checkError);
      return {
        success: false,
        error: 'Voucher já utilizado ou não encontrado',
        voucherType: 'descartavel'
      };
    }

    // Preparar timestamp
    const now = new Date();
    const timestamp = formatInTimeZone(now, 'America/Sao_Paulo', "yyyy-MM-dd'T'HH:mm:ssXXX");

    // Registrar o uso primeiro
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
      return {
        success: false,
        error: 'Erro ao registrar uso do voucher',
        voucherType: 'descartavel'
      };
    }

    // Depois marcar o voucher como usado
    const { error: updateError } = await supabase
      .from('vouchers_descartaveis')
      .update({ usado_em: timestamp })
      .eq('id', voucherDescartavel.id)
      .is('usado_em', null);

    if (updateError) {
      logger.error('Erro ao atualizar voucher:', updateError);
      // Tentar reverter o registro de uso
      await supabase
        .from('uso_voucher')
        .delete()
        .eq('voucher_descartavel_id', voucherDescartavel.id)
        .eq('usado_em', timestamp);

      return {
        success: false,
        error: 'Erro ao processar voucher',
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