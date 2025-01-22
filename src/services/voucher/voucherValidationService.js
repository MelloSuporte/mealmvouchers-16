import { validateCommonVoucher } from '../../components/voucher/validators/commonVoucherValidator';
import { validateDisposableVoucher } from '../../components/voucher/validators/disposableVoucherValidator';
import logger from '../../config/logger';
import { supabase } from '../../config/supabase';

export const validateVoucher = async (codigo, tipoRefeicaoId) => {
  try {
    logger.info('Iniciando validação do voucher:', codigo);
    
    // Primeiro validar se o tipo de refeição existe e está ativo
    const { data: tipoRefeicao, error: tipoRefeicaoError } = await supabase
      .from('tipos_refeicao')
      .select('*')
      .eq('id', tipoRefeicaoId)
      .eq('ativo', true)
      .single();

    if (tipoRefeicaoError || !tipoRefeicao) {
      logger.error('Erro ao buscar tipo de refeição:', tipoRefeicaoError);
      return { 
        success: false, 
        error: 'Tipo de refeição não encontrado ou inativo' 
      };
    }

    // Identificar e validar o tipo de voucher
    const { data: disposableVoucher } = await validateDisposableVoucher(codigo, tipoRefeicaoId);
    
    if (disposableVoucher) {
      logger.info('Voucher descartável validado com sucesso');
      return { success: true, data: disposableVoucher };
    }

    // Se não for descartável, tenta validar como voucher comum
    const commonVoucherResult = await validateCommonVoucher(codigo, tipoRefeicaoId);
    return commonVoucherResult;

  } catch (error) {
    logger.error('Erro na validação:', error);
    return { 
      success: false, 
      error: error.message || 'Erro ao validar voucher'
    };
  }
};

// Re-export the imported functions so they can be used by other components
export { validateCommonVoucher, validateDisposableVoucher };

// Export validateVoucherTime function
export const validateVoucherTime = async (tipoRefeicaoId) => {
  try {
    if (!tipoRefeicaoId) {
      throw new Error('ID do tipo de refeição é obrigatório');
    }

    const { data: tipoRefeicao, error: tipoRefeicaoError } = await supabase
      .from('tipos_refeicao')
      .select('*')
      .eq('id', tipoRefeicaoId)
      .eq('ativo', true)
      .single();

    if (tipoRefeicaoError || !tipoRefeicao) {
      logger.error('Erro ao validar horário - tipo de refeição não encontrado:', tipoRefeicaoError);
      throw new Error('Tipo de refeição não encontrado ou inativo');
    }

    const { data, error } = await supabase
      .rpc('validate_meal_time', {
        p_tipo_refeicao_id: tipoRefeicaoId
      });

    if (error) {
      logger.error('Erro ao validar horário:', error);
      throw error;
    }

    return data;
  } catch (error) {
    logger.error('Erro ao validar horário:', error);
    throw error;
  }
};