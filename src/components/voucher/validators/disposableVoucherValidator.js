import { supabase } from '../../../config/supabase';
import logger from '../../../config/logger';

export const findDisposableVoucher = async (code) => {
  try {
    logger.info('Buscando voucher descartável:', code);
    
    const { data, error } = await supabase
      .from('vouchers_descartaveis')
      .select('*')
      .eq('codigo', code)
      .is('usado_em', null)
      .single();

    if (error) {
      logger.error('Erro ao buscar voucher descartável:', error);
      throw error;
    }

    if (!data) {
      logger.info('Voucher descartável não encontrado ou expirado:', code);
      return { data: null };
    }

    return { data };
  } catch (error) {
    logger.error('Erro ao buscar voucher descartável:', error);
    throw error;
  }
};

export const validateDisposableVoucherType = (voucher, tipoRefeicaoId) => {
  if (voucher.tipo_refeicao_id !== tipoRefeicaoId) {
    return {
      success: false,
      error: 'Tipo de refeição não corresponde ao voucher descartável',
      voucherType: 'descartavel'
    };
  }
  return { success: true };
};

export const validateDisposableVoucherTime = async (voucher) => {
  try {
    const { data: tipoRefeicao } = await supabase
      .from('tipos_refeicao')
      .select('*')
      .eq('id', voucher.tipo_refeicao_id)
      .single();

    if (!tipoRefeicao) {
      return {
        success: false,
        error: 'Tipo de refeição não encontrado',
        voucherType: 'descartavel'
      };
    }

    const currentTime = new Date();
    const startTime = new Date();
    const endTime = new Date();
    
    const [startHour, startMinute] = tipoRefeicao.horario_inicio.split(':');
    const [endHour, endMinute] = tipoRefeicao.horario_fim.split(':');
    
    startTime.setHours(parseInt(startHour), parseInt(startMinute), 0);
    endTime.setHours(parseInt(endHour), parseInt(endMinute), 0);
    endTime.setMinutes(endTime.getMinutes() + tipoRefeicao.minutos_tolerancia);

    if (currentTime < startTime || currentTime > endTime) {
      return {
        success: false,
        error: `Esta refeição só pode ser utilizada entre ${tipoRefeicao.horario_inicio} e ${tipoRefeicao.horario_fim}`,
        voucherType: 'descartavel'
      };
    }

    return { success: true };
  } catch (error) {
    logger.error('Erro ao validar horário do voucher descartável:', error);
    throw error;
  }
};