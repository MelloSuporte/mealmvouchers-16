import { supabase } from '../../../config/supabase';
import logger from '../../../config/logger';

export const findDisposableVoucher = async (code) => {
  try {
    logger.info('Buscando voucher descartável:', code);
    
    const { data, error } = await supabase
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
      .eq('codigo', code)
      .is('usado_em', null)
      .single();

    if (error) {
      logger.error('Erro ao buscar voucher descartável:', error);
      throw error;
    }

    if (!data) {
      logger.info('Voucher descartável não encontrado ou já utilizado:', code);
      return { data: null };
    }

    logger.info('Voucher descartável encontrado:', data);
    return { data };
  } catch (error) {
    logger.error('Erro ao buscar voucher descartável:', error);
    throw error;
  }
};

export const validateDisposableVoucher = async (code, tipoRefeicaoId) => {
  try {
    // First validate if meal type exists and is active
    if (!tipoRefeicaoId) {
      logger.error('ID do tipo de refeição não fornecido');
      return { success: false, error: 'Tipo de refeição não fornecido' };
    }

    const { data: mealType, error: mealTypeError } = await supabase
      .from('tipos_refeicao')
      .select('*')
      .eq('id', tipoRefeicaoId)
      .eq('ativo', true)
      .single();

    if (mealTypeError || !mealType) {
      logger.error('Erro ao validar tipo de refeição:', mealTypeError);
      return { success: false, error: 'Tipo de refeição não encontrado ou inativo' };
    }

    const result = await findDisposableVoucher(code);
    
    if (!result.data) {
      return { success: false, error: 'Voucher descartável não encontrado ou já utilizado' };
    }

    const voucher = result.data;

    // Validate if voucher matches the meal type
    if (voucher.tipo_refeicao_id !== tipoRefeicaoId) {
      logger.error('Tipo de refeição do voucher não corresponde:', {
        voucher: voucher.tipo_refeicao_id,
        requested: tipoRefeicaoId
      });
      return { success: false, error: 'Tipo de refeição inválido para este voucher' };
    }

    // Validate meal type is active
    if (!voucher.tipos_refeicao?.ativo) {
      logger.error('Tipo de refeição inativo:', voucher.tipos_refeicao?.nome);
      return { success: false, error: 'Tipo de refeição inativo' };
    }

    return { 
      success: true, 
      data: voucher,
      message: 'Voucher descartável válido'
    };
  } catch (error) {
    logger.error('Erro ao validar voucher descartável:', error);
    return { 
      success: false, 
      error: error.message || 'Erro ao validar voucher descartável'
    };
  }
};