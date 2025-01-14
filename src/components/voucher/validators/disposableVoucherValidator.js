import { supabase } from '../../../config/supabase';
import logger from '../../../config/logger';

export const findDisposableVoucher = async (codigo) => {
  try {
    logger.info('Buscando voucher descartável:', codigo);
    
    const { data, error } = await supabase
      .from('vouchers_descartaveis')
      .select(`
        id,
        codigo,
        tipo_refeicao_id,
        data_expiracao,
        usado_em,
        tipos_refeicao (
          id,
          nome,
          ativo,
          valor,
          horario_inicio,
          horario_fim,
          minutos_tolerancia
        )
      `)
      .eq('codigo', codigo)
      .is('usado_em', null)
      .gte('data_expiracao', new Date().toISOString().split('T')[0])
      .maybeSingle();

    if (error) {
      logger.error('Erro na consulta do voucher descartável:', error);
      throw error;
    }

    if (!data) {
      logger.info('Voucher descartável não encontrado ou expirado:', codigo);
    } else {
      logger.info('Voucher descartável encontrado:', data);
    }

    return { data, error: null };
  } catch (error) {
    logger.error('Erro ao buscar voucher descartável:', error);
    return { data: null, error };
  }
};

export const validateDisposableVoucherType = (voucherDescartavel, tipoRefeicaoId) => {
  if (voucherDescartavel.tipo_refeicao_id !== tipoRefeicaoId) {
    logger.error('Tipo de refeição não corresponde:', {
      voucher: voucherDescartavel.tipo_refeicao_id,
      requested: tipoRefeicaoId
    });
    return {
      success: false,
      error: 'Este voucher não é válido para este tipo de refeição',
      voucherType: 'descartavel'
    };
  }
  return { success: true };
};

export const validateDisposableVoucherTime = (voucherDescartavel) => {
  const tipoRefeicao = voucherDescartavel.tipos_refeicao;
  if (!tipoRefeicao.ativo) {
    return {
      success: false,
      error: 'Tipo de refeição inativo',
      voucherType: 'descartavel'
    };
  }

  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5);
  const startTime = tipoRefeicao.horario_inicio;
  const endTime = new Date(`2000-01-01T${tipoRefeicao.horario_fim}`);
  endTime.setMinutes(endTime.getMinutes() + (tipoRefeicao.minutos_tolerancia || 0));
  const endTimeStr = endTime.toTimeString().slice(0, 5);

  if (currentTime < startTime || currentTime > endTimeStr) {
    return {
      success: false,
      error: `Esta refeição só pode ser utilizada entre ${startTime} e ${tipoRefeicao.horario_fim} (tolerância de ${tipoRefeicao.minutos_tolerancia} minutos)`,
      voucherType: 'descartavel'
    };
  }

  return { success: true };
};