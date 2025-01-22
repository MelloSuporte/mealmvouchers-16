import { supabase } from '../../../config/supabase';
import logger from '../../../config/logger';

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