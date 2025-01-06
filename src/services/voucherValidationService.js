import { supabase } from '../config/supabase';
import logger from '../config/logger';

export const validateDisposableVoucher = async (codigo, tipoRefeicaoId) => {
  try {
    logger.info('Iniciando validação do voucher descartável:', { codigo, tipoRefeicaoId });
    
    const { data, error } = await supabase.rpc('validate_disposable_voucher', {
      p_codigo: codigo,
      p_tipo_refeicao_id: tipoRefeicaoId
    });

    if (error) {
      logger.error('Erro ao validar voucher descartável:', error);
      throw error;
    }

    return data;
  } catch (error) {
    logger.error('Erro ao validar voucher descartável:', error);
    throw error;
  }
};

export const validateCommonVoucher = async (codigo, tipoRefeicaoId) => {
  try {
    const { data, error } = await supabase.rpc('validate_common_voucher', {
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
    throw error;
  }
};

export const validateExtraVoucher = async (codigo, tipoRefeicaoId) => {
  try {
    const { data, error } = await supabase.rpc('validate_extra_voucher', {
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
    throw error;
  }
};

export const validateMealTimeAndInterval = async (userId, mealTypeId) => {
  try {
    const { data, error } = await supabase.rpc('validate_meal_time_and_interval', {
      p_usuario_id: userId,
      p_tipo_refeicao_id: mealTypeId
    });

    if (error) {
      logger.error('Erro ao validar horário e intervalo:', error);
      throw error;
    }

    return data;
  } catch (error) {
    logger.error('Erro na validação de horário e intervalo:', error);
    throw error;
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
      .single();

    if (usuario) {
      logger.info('Voucher identificado como comum');
      return 'comum';
    }

    // Tenta encontrar como voucher extra
    const { data: voucherExtra } = await supabase
      .from('vouchers_extras')
      .select('*')
      .eq('codigo', voucherCode)
      .single();

    if (voucherExtra) {
      logger.info('Voucher identificado como extra');
      return 'extra';
    }

    // Tenta encontrar como voucher descartável
    const { data: voucherDescartavel } = await supabase
      .from('vouchers_descartaveis')
      .select('*')
      .eq('codigo', voucherCode)
      .single();

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