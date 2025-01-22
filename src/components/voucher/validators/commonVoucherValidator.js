import { supabase } from '../../../config/supabase';
import logger from '../../../config/logger';

export const validateCommonVoucher = async (code, tipoRefeicaoId) => {
  try {
    logger.info('Validando voucher comum:', code);
    
    // Primeiro validar se o tipo de refeição existe e está ativo
    const { data: tipoRefeicao, error: tipoRefeicaoError } = await supabase
      .from('tipos_refeicao')
      .select('*')
      .eq('id', tipoRefeicaoId)
      .eq('ativo', true)
      .single();

    if (tipoRefeicaoError || !tipoRefeicao) {
      logger.error('Erro ao buscar tipo de refeição:', tipoRefeicaoError);
      return { 
        success: false, 
        error: 'Tipo de refeição não encontrado ou inativo' 
      };
    }

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
      return { data: null };
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

    logger.info('Voucher comum válido:', data);
    return { data };
  } catch (error) {
    logger.error('Erro ao validar voucher comum:', error);
    throw error;
  }
};