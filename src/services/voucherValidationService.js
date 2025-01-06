import { supabase } from '../config/supabase';
import logger from '../config/logger';

export const validateDisposableVoucher = async (codigo, tipoRefeicaoId) => {
  try {
    logger.info('Iniciando validação do voucher descartável:', { codigo, tipoRefeicaoId });
    
    // Validate both parameters are present
    if (!codigo || !tipoRefeicaoId) {
      logger.error('Parâmetros inválidos:', { codigo, tipoRefeicaoId });
      throw new Error('Código do voucher e tipo de refeição são obrigatórios');
    }

    // Buscar voucher com informações do tipo de refeição
    const { data: voucher, error } = await supabase
      .from('vouchers_descartaveis')
      .select(`
        *,
        tipos_refeicao (
          id,
          nome,
          horario_inicio,
          horario_fim,
          minutos_tolerancia,
          ativo
        )
      `)
      .eq('codigo', String(codigo))
      .eq('tipo_refeicao_id', tipoRefeicaoId)
      .is('usado_em', null)
      .is('data_uso', null)
      .gte('data_expiracao', new Date().toISOString())
      .maybeSingle();

    if (error) {
      logger.error('Erro ao buscar voucher descartável:', error);
      throw new Error('Erro ao validar voucher descartável');
    }

    if (!voucher) {
      return { success: false, error: 'Voucher não encontrado ou já utilizado' };
    }

    // Verificar tipo de refeição
    if (!voucher.tipos_refeicao?.ativo) {
      return { success: false, error: 'Tipo de refeição inativo' };
    }

    // Marcar voucher como usado
    const { error: updateError } = await supabase
      .from('vouchers_descartaveis')
      .update({
        usado_em: new Date().toISOString(),
        data_uso: new Date().toISOString()
      })
      .eq('id', voucher.id)
      .is('usado_em', null);

    if (updateError) {
      logger.error('Erro ao atualizar voucher:', updateError);
      throw new Error('Erro ao marcar voucher como usado');
    }

    return { success: true, voucher };
  } catch (error) {
    logger.error('Erro ao validar voucher descartável:', error);
    return { success: false, error: error.message };
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