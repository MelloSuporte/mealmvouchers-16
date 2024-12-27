import { supabase } from '../../../config/supabase';
import logger from '../../../config/logger';

export const validateCommonVoucher = async (codigo) => {
  try {
    logger.info('Validando voucher comum:', codigo);
    
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('*, empresas(*), turnos(*)')
      .eq('voucher', String(codigo))
      .single();

    if (error || !usuario) {
      logger.info('Voucher comum inválido');
      return { success: false, error: 'Voucher comum inválido' };
    }

    logger.info('Voucher comum válido:', usuario);

    // Verificar se o usuário está suspenso
    if (usuario.suspenso) {
      return { success: false, error: 'Usuário suspenso' };
    }

    // Verificar se a empresa está ativa
    if (!usuario.empresas?.ativo) {
      return { success: false, error: 'Empresa inativa' };
    }

    return { success: true, user: usuario };
  } catch (error) {
    logger.error('Erro ao validar voucher comum:', error);
    throw error;
  }
};