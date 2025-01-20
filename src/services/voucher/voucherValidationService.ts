import { supabase } from '../../config/supabase';
import logger from '../../config/logger';

export const validateCommonVoucher = async (code: string) => {
  try {
    logger.info('Validando voucher comum:', code);
    
    const { data, error } = await supabase
      .from('vouchers_comuns')
      .select(`
        *,
        usuarios (
          id,
          nome,
          cpf,
          suspenso,
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
        )
      `)
      .eq('codigo', code)
      .is('usado', false)
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

    // Validar se o usuário está suspenso
    if (data.usuarios?.suspenso) {
      logger.info('Usuário suspenso:', data.usuarios.nome);
      return { data: null, error: 'Usuário suspenso' };
    }

    // Validar se a empresa está ativa
    if (!data.usuarios?.empresas?.ativo) {
      logger.info('Empresa inativa:', data.usuarios?.empresas?.nome);
      return { data: null, error: 'Empresa inativa' };
    }

    // Validar se o turno está ativo
    if (!data.usuarios?.turnos?.ativo) {
      logger.info('Turno inativo:', data.usuarios?.turnos?.tipo_turno);
      return { data: null, error: 'Turno inativo' };
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