import { supabase } from '../../config/supabase';
import logger from '../../config/logger';

export const validateCommonVoucher = async (code: string) => {
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
      return { data: null, error: 'Voucher não encontrado' };
    }

    // Validar se o usuário está suspenso
    if (data.suspenso) {
      logger.info('Usuário suspenso:', data.nome);
      return { data: null, error: 'Usuário suspenso' };
    }

    // Validar se a empresa está ativa
    if (!data.empresas?.ativo) {
      logger.info('Empresa inativa:', data.empresas?.nome);
      return { data: null, error: 'Empresa inativa' };
    }

    // Validar se o turno está ativo
    if (!data.turnos?.ativo) {
      logger.info('Turno inativo:', data.turnos?.tipo_turno);
      return { data: null, error: 'Turno inativo' };
    }

    // Verificar se já foi usado hoje
    const { data: usoHoje, error: erroUso } = await supabase
      .from('uso_voucher')
      .select('*')
      .eq('usuario_id', data.id)
      .eq('tipo_voucher', 'comum')
      .gte('usado_em', new Date().toISOString().split('T')[0]);

    if (erroUso) {
      logger.error('Erro ao verificar uso do voucher:', erroUso);
      throw erroUso;
    }

    if (usoHoje && usoHoje.length > 0) {
      logger.info('Voucher já utilizado hoje:', code);
      return { data: null, error: 'Voucher já utilizado hoje' };
    }

    logger.info('Voucher comum válido:', data);
    return { data };
  } catch (error) {
    logger.error('Erro ao validar voucher comum:', error);
    throw error;
  }
};

export const validateDisposableVoucher = async (code: string) => {
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

    // Validar se o tipo de refeição está ativo
    if (!data.tipos_refeicao?.ativo) {
      logger.info('Tipo de refeição inativo:', data.tipos_refeicao?.nome);
      return { data: null, error: 'Tipo de refeição inativo' };
    }

    logger.info('Voucher descartável encontrado:', data);
    return { data };
  } catch (error) {
    logger.error('Erro ao validar voucher descartável:', error);
    throw error;
  }
};

export const validateVoucherTime = async (tipoRefeicaoId: string) => {
  try {
    const { data, error } = await supabase
      .rpc('validate_meal_time', {
        p_tipo_refeicao_id: tipoRefeicaoId
      });

    if (error) {
      logger.error('Erro ao validar horário:', error);
      throw error;
    }

    return data;
  } catch (error) {
    logger.error('Erro ao validar horário:', error);
    throw error;
  }
};