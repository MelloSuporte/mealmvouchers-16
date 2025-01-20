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
      .not('usado', 'eq', true)
      .is('usado_em', null)
      .maybeSingle();

    if (error) {
      logger.error('Erro ao buscar voucher comum:', error);
      throw error;
    }

    if (!data) {
      logger.info('Voucher comum não encontrado ou já utilizado:', code);
      return { data: null };
    }

    // Validar turno do usuário
    const currentTime = new Date().toLocaleTimeString('pt-BR', { hour12: false });
    const turno = data.usuarios?.turnos;
    
    if (!turno?.ativo || 
        currentTime < turno?.horario_inicio || 
        currentTime > turno?.horario_fim) {
      logger.info('Voucher fora do horário do turno:', {
        currentTime,
        turnoInicio: turno?.horario_inicio,
        turnoFim: turno?.horario_fim
      });
      return { data: null, error: 'Fora do horário do turno' };
    }

    // Validar horário da refeição
    const mealType = data.tipos_refeicao;
    if (!mealType?.ativo) {
      return { data: null, error: 'Tipo de refeição inativo' };
    }

    const toleranceMinutes = mealType.minutos_tolerancia || 15;
    const endTimeWithTolerance = new Date();
    const [endHour, endMinute] = mealType.horario_fim.split(':');
    endTimeWithTolerance.setHours(parseInt(endHour), parseInt(endMinute) + toleranceMinutes);

    const mealEndTime = endTimeWithTolerance.toLocaleTimeString('pt-BR', { hour12: false });

    if (currentTime < mealType.horario_inicio || currentTime > mealEndTime) {
      logger.info('Voucher fora do horário da refeição:', {
        currentTime,
        refeicaoInicio: mealType.horario_inicio,
        refeicaoFim: mealEndTime
      });
      return { data: null, error: 'Fora do horário permitido para esta refeição' };
    }

    // Validar limite diário
    const { data: usageCount, error: usageError } = await supabase
      .from('uso_voucher')
      .select('count', { count: 'exact' })
      .eq('usuario_id', data.usuarios.id)
      .gte('usado_em', new Date().toISOString().split('T')[0]);

    if (usageError) {
      logger.error('Erro ao verificar limite diário:', usageError);
      throw usageError;
    }

    if (usageCount >= 3) {
      logger.info('Limite diário de refeições atingido');
      return { data: null, error: 'Limite diário de refeições atingido' };
    }

    logger.info('Voucher comum válido:', data);
    return { data };
  } catch (error) {
    logger.error('Erro ao buscar voucher comum:', error);
    throw error;
  }
};