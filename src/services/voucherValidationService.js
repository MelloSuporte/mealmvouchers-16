import { supabase } from '../config/supabase';
import logger from '../config/logger';

export const validateDisposableVoucher = async (codigo, tipoRefeicaoId) => {
  try {
    if (!codigo || !tipoRefeicaoId) {
      logger.error('Código do voucher e tipo de refeição são obrigatórios');
      throw new Error('Código do voucher e tipo de refeição são obrigatórios');
    }

    // Call the RPC function
    const { data, error } = await supabase
      .rpc('validate_and_use_voucher', {
        p_codigo: codigo,
        p_tipo_refeicao_id: tipoRefeicaoId
      });

    if (error) {
      logger.error('Erro ao validar voucher descartável:', error);
      throw error;
    }

    // Ensure we're not trying to read the response body multiple times
    if (!data) {
      return { success: false, error: 'Erro ao processar resposta do servidor' };
    }

    return { success: true, data };
  } catch (error) {
    logger.error('Erro ao validar voucher descartável:', error);
    return { success: false, error: error.message };
  }
};

export const validateCommonVoucher = async (codigo, tipoRefeicaoId) => {
  try {
    logger.info('Validando voucher comum:', codigo);
    
    // Call the RPC function with proper error handling
    const response = await supabase
      .rpc('validate_and_use_voucher', {
        p_codigo: codigo,
        p_tipo_refeicao_id: tipoRefeicaoId
      });

    if (response.error) {
      logger.error('Erro ao validar voucher comum:', response.error);
      throw response.error;
    }

    // Handle the response data properly
    if (!response.data) {
      return { success: false, error: 'Voucher inválido ou já utilizado' };
    }

    return { success: true, data: response.data };
  } catch (error) {
    logger.error('Erro ao validar voucher comum:', error);
    return { success: false, error: error.message };
  }
};

export const validateExtraVoucher = async (codigo, tipoRefeicaoId) => {
  try {
    logger.info('Validando voucher extra:', codigo);
    
    const { data, error } = await supabase
      .rpc('validate_and_use_voucher', {
        p_codigo: codigo,
        p_tipo_refeicao_id: tipoRefeicaoId
      });

    if (error) {
      logger.error('Erro ao validar voucher extra:', error);
      throw error;
    }

    if (!data) {
      return { success: false, error: 'Voucher extra inválido ou já utilizado' };
    }

    return { success: true, data };
  } catch (error) {
    logger.error('Erro ao validar voucher extra:', error);
    return { success: false, error: error.message };
  }
};