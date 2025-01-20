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
      .lte('data_expiracao', new Date().toISOString().split('T')[0])
      .single();

    if (error) {
      logger.error('Erro ao buscar voucher descartável:', error);
      throw error;
    }

    if (!data) {
      logger.info('Voucher descartável não encontrado ou já utilizado:', code);
      return { data: null };
    }

    // Validate meal time
    const currentTime = new Date();
    const currentTimeStr = currentTime.toLocaleTimeString('pt-BR', { hour12: false });
    
    const mealType = data.tipos_refeicao;
    if (!mealType || !mealType.ativo) {
      logger.info('Tipo de refeição inativo:', code);
      return { data: null, error: 'Tipo de refeição inativo' };
    }

    // Calculate end time with tolerance
    const [endHour, endMinute] = mealType.horario_fim.split(':');
    const endTime = new Date();
    endTime.setHours(parseInt(endHour), parseInt(endMinute), 0);
    endTime.setMinutes(endTime.getMinutes() + mealType.minutos_tolerancia);
    
    const endTimeStr = endTime.toLocaleTimeString('pt-BR', { hour12: false });

    if (!(currentTimeStr >= mealType.horario_inicio && currentTimeStr <= endTimeStr)) {
      logger.info('Fora do horário permitido:', {
        current: currentTimeStr,
        start: mealType.horario_inicio,
        end: endTimeStr
      });
      return { 
        data: null, 
        error: `Esta refeição só pode ser utilizada entre ${mealType.horario_inicio} e ${mealType.horario_fim} (+ ${mealType.minutos_tolerancia} min de tolerância)`
      };
    }

    logger.info('Voucher descartável encontrado e validado:', data);
    return { data };
  } catch (error) {
    logger.error('Erro ao buscar voucher descartável:', error);
    throw error;
  }
};