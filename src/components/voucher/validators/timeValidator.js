import { supabase } from '../../../config/supabase';
import logger from '../../../config/logger';

export const validateMealTime = async (tipoRefeicaoId) => {
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