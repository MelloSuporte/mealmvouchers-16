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
      .is('usado', false)
      .maybeSingle();

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

export const validateDisposableVoucher = async (code) => {
  try {
    const result = await findDisposableVoucher(code);
    
    if (!result.data) {
      return { success: false, error: 'Voucher descartável não encontrado ou já utilizado' };
    }

    const voucher = result.data;
    const mealType = voucher.tipos_refeicao;

    if (!mealType) {
      logger.error('Tipo de refeição não encontrado para o voucher:', code);
      return { success: false, error: 'Tipo de refeição não encontrado' };
    }

    if (!mealType.ativo) {
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