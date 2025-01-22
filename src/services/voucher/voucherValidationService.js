import { supabase } from '../../config/supabase';
import logger from '../../config/logger';

export const validateCommonVoucher = async (code) => {
  try {
    logger.info('Validando voucher comum:', code);
    
    const { data, error } = await supabase
      .from('usuarios')
      .select(`
        id,
        nome,
        cpf,
        suspenso,
        voucher,
        empresa_id,
        empresas (
          id,
          nome,
          ativo
        ),
        turnos (
          id,
          tipo_turno,
          horario_inicio,
          horario_fim,
          ativo
        )
      `)
      .eq('voucher', code)
      .single();

    if (error) {
      logger.error('Erro ao buscar voucher comum:', error);
      throw error;
    }

    if (!data) {
      logger.info('Voucher comum não encontrado:', code);
      return { data: null };
    }

    logger.info('Voucher comum válido:', data);
    return { data };
  } catch (error) {
    logger.error('Erro ao validar voucher comum:', error);
    throw error;
  }
};

export const validateDisposableVoucher = async (code) => {
  try {
    logger.info('Validando voucher descartável:', code);
    
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
    logger.error('Erro ao validar voucher descartável:', error);
    throw error;
  }
};

export const validateVoucherTime = async (tipoRefeicaoId) => {
  try {
    const { data, error } = await supabase
      .from('tipos_refeicao')
      .select('*')
      .eq('id', tipoRefeicaoId)
      .single();

    if (error) {
      logger.error('Erro ao validar horário do voucher:', error);
      throw error;
    }

    if (!data) {
      return {
        is_valid: false,
        message: 'Tipo de refeição não encontrado'
      };
    }

    const now = new Date();
    const currentTime = now.toLocaleTimeString('pt-BR', { hour12: false });
    const startTime = data.horario_inicio;
    const endTime = data.horario_fim;
    const toleranceMinutes = data.minutos_tolerancia || 15;

    // Adicionar tolerância ao horário final
    const [endHour, endMinute] = endTime.split(':');
    const endDateTime = new Date();
    endDateTime.setHours(parseInt(endHour), parseInt(endMinute) + toleranceMinutes, 0);
    const endTimeWithTolerance = endDateTime.toLocaleTimeString('pt-BR', { hour12: false });

    if (currentTime < startTime || currentTime > endTimeWithTolerance) {
      return {
        is_valid: false,
        message: `Esta refeição só pode ser utilizada entre ${startTime} e ${endTime} (tolerância de ${toleranceMinutes} minutos)`
      };
    }

    return { is_valid: true };
  } catch (error) {
    logger.error('Erro ao validar horário do voucher:', error);
    throw error;
  }
};