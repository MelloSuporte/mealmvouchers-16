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
    logger.error('Erro ao buscar voucher comum:', error);
    throw error;
  }
};