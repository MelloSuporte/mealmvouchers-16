import { supabase } from '../../config/supabase';
import logger from '../../config/logger';

export const findVoucherComum = async (codigo) => {
  try {
    const { data, error } = await supabase
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
      .eq('voucher', String(codigo))
      .eq('suspenso', false)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    logger.error('Erro ao buscar voucher comum:', error);
    return null;
  }
};

export const findVoucherExtra = async (codigo) => {
  try {
    const { data, error } = await supabase
      .from('vouchers_extras')
      .select('*')
      .eq('codigo', String(codigo))
      .is('usado_em', null)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    logger.error('Erro ao buscar voucher extra:', error);
    return null;
  }
};

export const findVoucherDescartavel = async (codigo) => {
  try {
    const { data, error } = await supabase
      .from('vouchers_descartaveis')
      .select('*')
      .eq('codigo', String(codigo))
      .is('usado_em', null)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    logger.error('Erro ao buscar voucher descartável:', error);
    return null;
  }
};