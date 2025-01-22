import { supabase } from '../../../config/supabase';
import logger from '../../../config/logger';
import { validateMealTime } from './timeValidator';

export const findCommonVoucher = async (code) => {
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
      return { data: null };
    }

    logger.info('Voucher comum válido:', data);
    return { data };
  } catch (error) {
    logger.error('Erro ao validar voucher comum:', error);
    throw error;
  }
};

export const validateCommonVoucher = async (code, tipoRefeicaoId) => {
  try {
    const { data: user } = await findCommonVoucher(code);
    
    if (!user) {
      return { success: false, error: 'Voucher não encontrado' };
    }

    if (user.suspenso) {
      return { success: false, error: 'Usuário suspenso' };
    }

    if (!user.empresas?.ativo) {
      return { success: false, error: 'Empresa inativa' };
    }

    // Validar tipo de refeição
    const { data: tipoRefeicao, error: tipoRefeicaoError } = await supabase
      .from('tipos_refeicao')
      .select('*')
      .eq('id', tipoRefeicaoId)
      .single();

    if (tipoRefeicaoError || !tipoRefeicao) {
      logger.error('Erro ao buscar tipo de refeição:', tipoRefeicaoError);
      return { success: false, error: 'Tipo de refeição não encontrado' };
    }

    if (!tipoRefeicao.ativo) {
      return { success: false, error: 'Tipo de refeição inativo' };
    }

    // Validar horário
    const timeValidation = await validateMealTime(tipoRefeicao);
    if (!timeValidation.success) {
      return timeValidation;
    }

    return { 
      success: true, 
      data: {
        user,
        tipoRefeicao
      }
    };

  } catch (error) {
    logger.error('Erro na validação do voucher comum:', error);
    return { success: false, error: error.message };
  }
};