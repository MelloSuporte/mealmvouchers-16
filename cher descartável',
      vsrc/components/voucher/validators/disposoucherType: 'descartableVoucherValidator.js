importavel'
    };
  }
};
</ { supabase } from '../../../config/supalov-write>

2.base';
import logger from '../../../config/ Update the disposable voucher validator:

<lovlogger';

export const findDisposableVou-write file_path="src/cher = async (code) => {
  components/voucher/validators/dispostry {
    logger.info('BableVoucherValidator.js">uscando voucher descartável:', code);
    
import { supabase } from '../
    const { data, error } = await su../../config/supabase';pabase
      .from('vouchers_
import logger from '../../../config/loggerdescartaveis')
      .select(`';

export const findDisposableVou
        *,
        tipos_refeicaocher = async (code) => { (
          id,
          nome,
  try {
    logger.info('Busc
          horario_inicio,
          horarioando voucher descartável:', code);_fim,
          minutos_toler
    
    const { data, error } =ancia,
          ativo
        ) await supabase
      `)
      .eq('codigo',
      .from('vouchers_descartaveis')
      . code)
      .is('usado_em', null)select(`
        *,
      .is('usado', false)
      .ma
        tipos_refeicybeSingle();

    if (error)ao (
          id, {
      logger.error('Erro ao
          nome,
          hor buscar voucher descartável:', error);
      throwario_inicio,
          horario_fim, error;
    }

    if (!data) {
      logger
          minutos_tolerancia,.info('Voucher descartável não encontra
          ativo
        )
      `)
      .eq('codigo', code)do ou já utilizado:', code);
      return {
      .is('usa data: null };
    }

    do_em', null)
      .is('usado', false)// Validate if voucher is within
      .maybeSingle();

    if (error) { valid time range
    const currentTime = new Date();
      logger.error('Erro ao buscar vou
    const mealType = data.tipos_cher descartável:', error);
      throwrefeicao;
    
    if (m error;
    }

    if (!ealType) {
      const [startHdata) {
      logger.infoour, startMinute] = mealType('Voucher desc.horario_inicio.split(':');artável não encontrado ou
      const [endHour, endMinute já util] = mealType.horario_fimizado:', code);
      .split(':');
      return { data
      const startTime = new Date();: null };
      startTime.setHours(parseInt
    }

    logger.info('(startHour), parseInt(startMinuteVoucher descartável encontrado:',), 0);
      
      const en data);
    dTime = new Date();
      endTime.return { data };
  } catch (error) {setHours(parseInt(endHour),
    logger.error('Erro parseInt(endMinute), 0); ao buscar voucher descartável:', error);
      endTime.setMinutes(endTime.
    throw error;
  }
};getMinutes() + (mealType.min