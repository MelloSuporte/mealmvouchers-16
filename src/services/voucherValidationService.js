import { supabase } from '../config/supabase';
import logger from '../config/logger';

export const validateMealTimeAndInterval = async (tipoRefeicaoId) => {
  try {
    const { data, error } = await supabase
      .rpc('validate_meal_time', {
        p_tipo_refeicao_id: tipoRefeicaoId
      });

    if (error) {
      logger.error('Erro ao validar horário e intervalo:', error);
      throw error;
    }

    return data || { success: true };
  } catch (error) {
    logger.error('Erro ao validar horário e intervalo:', error);
    return { 
      success: false, 
      error: error.message || 'Erro ao validar horário e intervalo da refeição'
    };
  }
};

export const validateDisposableVoucher = async (codigo, tipoRefeicaoId) => {
  try {
    if (!codigo || !tipoRefeicaoId) {
      throw new Error('Código do voucher e tipo de refeição são obrigatórios');
    }

    // Use maybeSingle() instead of single()
    const { data: voucher, error } = await supabase
      .from('vouchers_descartaveis')
      .select('*')
      .eq('codigo', codigo)
      .maybeSingle();

    if (error) {
      logger.error('Erro ao validar voucher descartável:', error);
      throw error;
    }

    if (!voucher) {
      return { success: false, error: 'Voucher descartável não encontrado' };
    }

    const { data, error: usageError } = await supabase
      .rpc('validate_and_use_voucher', {
        p_codigo: codigo,
        p_tipo_refeicao_id: tipoRefeicaoId
      });

    if (usageError) {
      logger.error('Erro ao validar voucher descartável:', usageError);
      throw usageError;
    }

    return data;
  } catch (error) {
    logger.error('Erro ao validar voucher descartável:', error);
    return { success: false, error: error.message };
  }
};

export const validateCommonVoucher = async (codigo, tipoRefeicaoId) => {
  try {
    if (!codigo || !tipoRefeicaoId) {
      throw new Error('Código do voucher e tipo de refeição são obrigatórios');
    }

    const { data, error } = await supabase
      .rpc('validate_and_use_voucher', {
        p_codigo: codigo,
        p_tipo_refeicao_id: tipoRefeicaoId
      });

    if (error) {
      logger.error('Erro ao validar voucher comum:', error);
      throw error;
    }

    return data;
  } catch (error) {
    logger.error('Erro ao validar voucher comum:', error);
    return { success: false, error: error.message };
  }
};

export const validateExtraVoucher = async (codigo, tipoRefeicaoId) => {
  try {
    if (!codigo || !tipoRefeicaoId) {
      throw new Error('Código do voucher e tipo de refeição são obrigatórios');
    }

    const { data, error } = await supabase
      .rpc('validate_and_use_voucher', {
        p_codigo: codigo,
        p_tipo_refeicao_id: tipoRefeicaoId
      });

    if (error) {
      logger.error('Erro ao validar voucher extra:', error);
      throw error;
    }

    return data;
  } catch (error) {
    logger.error('Erro ao validar voucher extra:', error);
    return { success: false, error: error.message };
  }
};

export const identifyVoucherType = async (codigo) => {
  try {
    logger.info('Identificando tipo de voucher:', codigo);
    
    // Garantir que o código seja uma string
    const voucherCode = String(codigo);
    
    // Primeiro tenta encontrar como voucher comum
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('voucher')
      .eq('voucher', voucherCode)
      .maybeSingle();

    if (usuario) {
      logger.info('Voucher identificado como comum');
      return 'comum';
    }

    // Tenta encontrar como voucher descartável
    const { data: voucherDescartavel } = await supabase
      .from('vouchers_descartaveis')
      .select('*')
      .eq('codigo', voucherCode)
      .maybeSingle();

    if (voucherDescartavel) {
      logger.info('Voucher identificado como descartável');
      return 'descartavel';
    }

    logger.info('Tipo de voucher não identificado');
    return null;
  } catch (error) {
    logger.error('Erro ao identificar tipo de voucher:', error);
    return null;
  }
};
