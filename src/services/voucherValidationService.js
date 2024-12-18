import { supabase } from '../config/supabase';
import { toast } from "sonner";

export const validateDisposableVoucher = async (code) => {
  try {
    console.log('Validando voucher descartável:', code);
    
    const { data: voucher, error } = await supabase
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
      .eq('usado', false)
      .maybeSingle();

    if (error) {
      console.error('Erro ao validar voucher descartável:', error);
      return { success: false, error: 'Erro ao validar voucher' };
    }

    if (!voucher) {
      console.log('Voucher descartável não encontrado ou já utilizado');
      return { success: false, error: 'Voucher inválido ou já utilizado' };
    }

    return { success: true, voucher };
  } catch (error) {
    console.error('Erro inesperado ao validar voucher:', error);
    return { success: false, error: 'Erro ao validar voucher' };
  }
};

export const validateCommonVoucher = async (code) => {
  try {
    console.log('Validando voucher comum:', code);
    
    const { data: user, error } = await supabase
      .from('usuarios')
      .select(`
        *,
        empresas (
          id,
          nome
        ),
        turnos (
          id,
          tipo_turno
        )
      `)
      .eq('voucher', code)
      .eq('suspenso', false)
      .maybeSingle();

    if (error) {
      console.error('Erro ao validar voucher comum:', error);
      return { success: false, error: 'Erro ao validar voucher' };
    }

    if (!user) {
      console.log('Usuário não encontrado ou suspenso');
      return { success: false, error: 'Voucher inválido ou já utilizado' };
    }

    return { success: true, user };
  } catch (error) {
    console.error('Erro inesperado ao validar voucher comum:', error);
    return { success: false, error: 'Erro ao validar voucher' };
  }
};