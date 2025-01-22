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

export const validateDisposableVoucher = async (code, tipoRefeicaoId) => {
  try {
    if (!code || !tipoRefeicaoId) {
      throw new Error('Código do voucher e tipo de refeição são obrigatórios');
    }

    const result = await findDisposableVoucher(code);
    
    if (!result.data) {
      return { success: false, error: 'Voucher descartável não encontrado ou já utilizado' };
    }

    const voucher = result.data;

    // Validate if voucher matches the meal type
    if (voucher.tipo_refeicao_id !== tipoRefeicaoId) {
      logger.error('Tipo de refeição não corresponde:', {
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