import { supabase } from '../../../config/supabase';
import logger from '../../../config/logger';

export const validateVoucherTime = async (tipoRefeicaoId: string, turnoId: string) => {
  try {
    const { data, error } = await supabase.rpc('check_meal_time_and_shift', {
      p_tipo_refeicao_id: tipoRefeicaoId,
      p_turno_id: turnoId
    });

    if (error) throw error;
    return data;
  } catch (error) {
    logger.error('Erro ao validar horário:', error);
    throw new Error('Erro ao validar horário do voucher');
  }
};