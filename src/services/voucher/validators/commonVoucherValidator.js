import { supabase } from '../../../config/supabase';
import logger from '../../../config/logger';

export const validateCommonVoucher = async (codigo, tipoRefeicaoId) => {
  try {
    logger.info('Validando voucher comum:', { codigo, tipoRefeicaoId });

    const { data: user, error } = await supabase
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
      .eq('voucher', codigo)
      .maybeSingle();

    if (error) {
      logger.error('Erro ao buscar usuário:', error);
      throw error;
    }

    if (!user) {
      logger.warn('Usuário não encontrado para o voucher:', codigo);
      return {
        success: false,
        error: 'Voucher não encontrado'
      };
    }

    // Validate user status
    if (user.suspenso) {
      logger.warn('Usuário suspenso:', user.nome);
      return {
        success: false,
        error: 'Usuário suspenso'
      };
    }

    // Validate company status
    if (!user.empresas?.ativo) {
      logger.warn('Empresa inativa:', user.empresas?.nome);
      return {
        success: false,
        error: 'Empresa inativa'
      };
    }

    // Validate shift status
    if (!user.turnos?.ativo) {
      logger.warn('Turno inativo:', user.turnos?.tipo_turno);
      return {
        success: false,
        error: 'Turno inativo'
      };
    }

    logger.info('Voucher comum válido:', user);
    return {
      success: true,
      data: user,
      message: 'Voucher válido'
    };

  } catch (error) {
    logger.error('Erro ao validar voucher comum:', error);
    return {
      success: false,
      error: error.message || 'Erro ao validar voucher comum'
    };
  }
};