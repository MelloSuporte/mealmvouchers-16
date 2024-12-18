import { supabase } from '../config/supabase';

export const validateDisposableVoucher = async (code) => {
  try {
    console.log('Iniciando validação detalhada do voucher descartável:', code);
    
    // Buscar voucher com joins e condições explícitas
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
      .gte('data_expiracao', new Date().toISOString().split('T')[0])
      .maybeSingle();

    console.log('Resultado da consulta:', { voucher, error });

    if (error) {
      console.error('Erro ao validar voucher descartável:', error);
      return { success: false, error: 'Erro ao validar voucher' };
    }

    if (!voucher) {
      console.log('Voucher não encontrado ou já utilizado');
      return { success: false, error: 'Voucher inválido ou já utilizado' };
    }

    // Verificar se o tipo de refeição está ativo
    if (!voucher.tipos_refeicao?.ativo) {
      console.log('Tipo de refeição inativo:', voucher.tipos_refeicao);
      return { success: false, error: 'Tipo de refeição inativo' };
    }

    // Verificar data de expiração
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expirationDate = new Date(voucher.data_expiracao);
    expirationDate.setHours(0, 0, 0, 0);

    if (expirationDate < today) {
      console.log('Voucher expirado:', { expirationDate, today });
      return { success: false, error: 'Voucher expirado' };
    }

    console.log('Voucher válido:', voucher);
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
          nome,
          ativo
        ),
        turnos (
          id,
          tipo_turno
        )
      `)
      .eq('voucher', code)
      .eq('suspenso', false)
      .maybeSingle();

    console.log('Resultado da consulta de usuário:', { user, error });

    if (error) {
      console.error('Erro ao validar voucher comum:', error);
      return { success: false, error: 'Erro ao validar voucher' };
    }

    if (!user) {
      console.log('Usuário não encontrado ou suspenso');
      return { success: false, error: 'Voucher inválido ou usuário suspenso' };
    }

    // Verificar se a empresa está ativa
    if (!user.empresas?.ativo) {
      console.log('Empresa inativa:', user.empresas);
      return { success: false, error: 'Empresa inativa' };
    }

    console.log('Voucher comum válido:', user);
    return { success: true, user };
  } catch (error) {
    console.error('Erro inesperado ao validar voucher comum:', error);
    return { success: false, error: 'Erro ao validar voucher' };
  }
};