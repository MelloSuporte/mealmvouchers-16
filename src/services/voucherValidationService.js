import { supabase } from '../config/supabase';
import logger from '../config/logger';

export const identifyVoucherType = async (code) => {
  try {
    // Garantir que o código seja uma string
    const voucherCode = String(code);
    
    logger.info('Identificando tipo de voucher:', voucherCode);

    // Primeiro tenta encontrar como voucher comum
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('voucher')
      .eq('voucher', voucherCode)
      .single();

    if (usuario) {
      logger.info('Voucher identificado como comum');
      return 'comum';
    }

    // Tenta encontrar como voucher extra
    const { data: voucherExtra } = await supabase
      .from('vouchers_extras')
      .select('*')
      .eq('codigo', voucherCode)
      .single();

    if (voucherExtra) {
      logger.info('Voucher identificado como extra');
      return 'extra';
    }

    // Tenta encontrar como voucher descartável
    const { data: voucherDescartavel } = await supabase
      .from('vouchers_descartaveis')
      .select('*')
      .eq('codigo', voucherCode)
      .single();

    if (voucherDescartavel) {
      logger.info('Voucher identificado como descartável');
      return 'descartavel';
    }

    logger.info('Tipo de voucher não identificado');
    return null;
  } catch (error) {
    logger.error('Erro ao identificar tipo de voucher:', error);
    return null;
  }
};

export const validateCommonVoucher = async (code) => {
  try {
    logger.info('Validando voucher comum:', code);
    
    const { data: user, error } = await supabase
      .from('usuarios')
      .select(`
        *,
        empresas (
          id,
          nome,
          ativo
        ),
        turnos (
          id,
          tipo_turno,
          horario_inicio,
          horario_fim
        )
      `)
      .eq('voucher', String(code))
      .eq('suspenso', false)
      .single();

    if (error || !user) {
      logger.info('Voucher comum inválido');
      return { success: false, error: 'Voucher comum inválido' };
    }

    // Verificar se o usuário está suspenso
    if (user.suspenso) {
      return { success: false, error: 'Usuário suspenso' };
    }

    // Verificar se a empresa está ativa
    if (!user.empresas?.ativo) {
      return { success: false, error: 'Empresa inativa' };
    }

    logger.info('Voucher comum válido:', user);
    return { success: true, user };
  } catch (error) {
    logger.error('Erro ao validar voucher comum:', error);
    throw error;
  }
};

export const validateDisposableVoucher = async (code) => {
  try {
    logger.info('Iniciando validação detalhada do voucher descartável:', code);
    
    const { data: voucher, error } = await supabase
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
      .eq('codigo', String(code))
      .is('usado_em', null)
      .gte('data_expiracao', new Date().toISOString().split('T')[0])
      .single();

    if (error || !voucher) {
      logger.info('Voucher não encontrado ou já utilizado');
      return { success: false, error: 'Voucher descartável inválido ou já utilizado' };
    }

    // Verificar se o tipo de refeição está ativo
    if (!voucher.tipos_refeicao?.ativo) {
      return { success: false, error: 'Tipo de refeição inativo' };
    }

    logger.info('Voucher descartável válido:', voucher);
    return { success: true, voucher };
  } catch (error) {
    logger.error('Erro ao validar voucher descartável:', error);
    return { success: false, error: 'Erro ao validar voucher' };
  }
};

export const validateMealTimeAndInterval = async (userId, mealTypeId) => {
  try {
    // Verificar última refeição do usuário
    const { data: lastMeal } = await supabase
      .from('uso_voucher')
      .select('usado_em')
      .eq('usuario_id', userId)
      .order('usado_em', { ascending: false })
      .limit(1)
      .single();

    if (lastMeal) {
      const lastMealTime = new Date(lastMeal.usado_em);
      const now = new Date();
      const hoursDiff = (now - lastMealTime) / (1000 * 60 * 60);

      if (hoursDiff < 2) {
        return {
          success: false,
          error: 'É necessário aguardar 2 horas entre refeições'
        };
      }
    }

    // Verificar se já usou este tipo de refeição hoje
    const today = new Date().toISOString().split('T')[0];
    const { data: mealCount } = await supabase
      .from('uso_voucher')
      .select('id')
      .eq('usuario_id', userId)
      .eq('tipo_refeicao_id', mealTypeId)
      .gte('usado_em', today);

    if (mealCount && mealCount.length > 0) {
      return {
        success: false,
        error: 'Você já utilizou este tipo de refeição hoje'
      };
    }

    // Verificar limite de 2 refeições diferentes por turno
    const { data: totalMealsToday } = await supabase
      .from('uso_voucher')
      .select('tipo_refeicao_id')
      .eq('usuario_id', userId)
      .gte('usado_em', today);

    if (totalMealsToday && totalMealsToday.length >= 2) {
      return {
        success: false,
        error: 'Limite de 2 refeições diferentes por turno atingido'
      };
    }

    return { success: true };
  } catch (error) {
    logger.error('Erro ao validar horários e intervalos:', error);
    return { success: false, error: 'Erro ao validar horários' };
  }
};