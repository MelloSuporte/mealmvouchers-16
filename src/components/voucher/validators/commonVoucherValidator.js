import { supabase } from '../../../config/supabase';
import logger from '../../../config/logger';

export const findCommonVoucher = async (code) => {
  try {
    logger.info('Buscando voucher comum:', code);
    
    const { data, error } = await supabase
      .from('vouchers_comuns')
      .select(`
        *,
        usuarios (
          id,
          nome,
          cpf,
          turno_id,
          turnos (
            id,
            tipo_turno,
            horario_inicio,
            horario_fim,
            ativo
          )
        ),
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
      logger.error('Erro ao buscar voucher comum:', error);
      throw error;
    }

    if (!data) {
      logger.info('Voucher comum não encontrado ou já utilizado:', code);
      return { data: null, error: 'Voucher não encontrado ou já utilizado' };
    }

    // Validate shift time
    const currentTime = new Date().toLocaleTimeString('pt-BR', { hour12: false });
    const turno = data.usuarios?.turnos;
    
    if (!turno?.ativo) {
      logger.info('Turno inativo:', turno);
      return { data: null, error: 'Turno inativo' };
    }

    if (!(currentTime >= turno.horario_inicio && currentTime <= turno.horario_fim)) {
      logger.info('Fora do horário do turno:', {
        current: currentTime,
        start: turno.horario_inicio,
        end: turno.horario_fim
      });
      return { 
        data: null, 
        error: `Fora do horário do turno (${turno.horario_inicio} - ${turno.horario_fim})`
      };
    }

    // Validate meal time
    const mealType = data.tipos_refeicao;
    if (!mealType?.ativo) {
      logger.info('Tipo de refeição inativo:', mealType);
      return { data: null, error: 'Tipo de refeição inativo' };
    }

    // Calculate end time with tolerance
    const [endHour, endMinute] = mealType.horario_fim.split(':');
    const endTime = new Date();
    endTime.setHours(parseInt(endHour), parseInt(endMinute), 0);
    endTime.setMinutes(endTime.getMinutes() + (mealType.minutos_tolerancia || 15));
    
    const endTimeStr = endTime.toLocaleTimeString('pt-BR', { hour12: false });

    if (!(currentTime >= mealType.horario_inicio && currentTime <= endTimeStr)) {
      logger.info('Fora do horário da refeição:', {
        current: currentTime,
        start: mealType.horario_inicio,
        end: endTimeStr
      });
      return { 
        data: null, 
        error: `Esta refeição só pode ser utilizada entre ${mealType.horario_inicio} e ${mealType.horario_fim} (+ ${mealType.minutos_tolerancia} min de tolerância)`
      };
    }

    // Check daily usage limit
    const today = new Date().toISOString().split('T')[0];
    const { data: usageCount, error: usageError } = await supabase
      .from('uso_voucher')
      .select('count', { count: 'exact' })
      .eq('usuario_id', data.usuarios.id)
      .gte('usado_em', today);

    if (usageError) {
      logger.error('Erro ao verificar limite diário:', usageError);
      throw usageError;
    }

    if (usageCount >= 3) {
      logger.info('Limite diário de refeições atingido');
      return { data: null, error: 'Limite diário de refeições atingido (máximo 3)' };
    }

    // Check minimum interval between meals
    const { data: lastUsage } = await supabase
      .from('uso_voucher')
      .select('usado_em')
      .eq('usuario_id', data.usuarios.id)
      .order('usado_em', { ascending: false })
      .limit(1)
      .single();

    if (lastUsage) {
      const lastUsageTime = new Date(lastUsage.usado_em);
      const currentDateTime = new Date();
      const hoursDiff = (currentDateTime - lastUsageTime) / (1000 * 60 * 60);

      if (hoursDiff < 3) {
        logger.info('Intervalo mínimo entre refeições não respeitado');
        return { 
          data: null, 
          error: 'É necessário aguardar 3 horas entre as refeições' 
        };
      }
    }

    logger.info('Voucher comum válido:', data);
    return { data };
  } catch (error) {
    logger.error('Erro ao buscar voucher comum:', error);
    throw error;
  }
};