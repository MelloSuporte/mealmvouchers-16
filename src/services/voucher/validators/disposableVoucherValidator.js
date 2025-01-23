import { supabase } from '../../../config/supabase';
import logger from '../../../config/logger';

export const validateDisposableVoucher = async (codigo, tipoRefeicaoId) => {
  try {
    logger.info('Validando voucher descartável:', { codigo, tipoRefeicaoId });

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
      .eq('codigo', codigo)
      .is('usado_em', null)
      .maybeSingle();

    if (error) {
      logger.error('Erro ao buscar voucher descartável:', error);
      throw error;
    }

    if (!voucher) {
      logger.warn('Voucher descartável não encontrado ou já utilizado:', codigo);
      return {
        success: false,
        error: 'Voucher descartável não encontrado ou já utilizado'
      };
    }

    // Validate meal type
    if (voucher.tipo_refeicao_id !== tipoRefeicaoId) {
      logger.warn('Tipo de refeição não corresponde:', {
        voucher: voucher.tipo_refeicao_id,
        requested: tipoRefeicaoId
      });
      return {
        success: false,
        error: 'Este voucher não é válido para este tipo de refeição'
      };
    }

    // Validate expiration
    const today = new Date();
    const expirationDate = new Date(voucher.data_expiracao);
    
    if (today > expirationDate) {
      logger.warn('Voucher expirado:', {
        expiration: voucher.data_expiracao,
        now: today
      });
      return {
        success: false,
        error: 'Voucher expirado'
      };
    }

    logger.info('Voucher descartável válido:', voucher);
    return {
      success: true,
      data: voucher,
      message: 'Voucher válido'
    };

  } catch (error) {
    logger.error('Erro ao validar voucher descartável:', error);
    return {
      success: false,
      error: error.message || 'Erro ao validar voucher descartável'
    };
  }
};