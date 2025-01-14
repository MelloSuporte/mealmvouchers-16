import { supabase } from '../../../config/supabase';
import logger from '../../../config/logger';

export const findCommonVoucher = async (codigo) => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select(`
        id,
        nome,
        cpf,
        turno_id,
        empresa_id,
        empresas (
          nome,
          ativo
        ),
        turnos (
          tipo_turno,
          horario_inicio,
          horario_fim
        )
      `)
      .eq('voucher', codigo)
      .maybeSingle();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    logger.error('Erro ao buscar voucher comum:', error);
    return { data: null, error };
  }
};