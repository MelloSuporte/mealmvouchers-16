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
          ativo,
          valor
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

    // Validate if voucher is within valid time range
    const currentTime = new Date();
    const mealType = data.tipos_refeicao;
    
    if (mealType) {
      const [startHour, startMinute] = mealType.horario_inicio.split(':');
      const [endHour, endMinute] = mealType.horario_fim.split(':');
      
      const startTime = new Date();
      startTime.setHours(parseInt(startHour), parseInt(startMinute), 0);
      
      const endTime = new Date();
      endTime.setHours(parseInt(endHour), parseInt(endMinute), 0);
      endTime.setMinutes(endTime.getMinutes() + (mealType.minutos_tolerancia || 0));

      if (currentTime < startTime || currentTime > endTime) {
        logger.info('Voucher fora do horário permitido:', {
          current: currentTime,
          start: startTime,
          end: endTime
        });
        return { data: null };
      }
    }

    logger.info('Voucher descartável encontrado:', data);
    return { data };
  } catch (error) {
    logger.error('Erro ao buscar voucher descartável:', error);
    throw error;
  }
};