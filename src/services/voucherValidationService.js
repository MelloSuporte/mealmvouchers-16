import { supabase } from '../config/supabase';
import logger from '../config/logger';

export const identifyVoucherType = async (codigo) => {
  try {
    logger.info('Identificando tipo de voucher:', codigo);
    
    // Check common voucher first
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('voucher')
      .eq('voucher', codigo)
      .maybeSingle();

    if (usuario) {
      logger.info('Voucher identificado como comum');
      return 'comum';
    }

    // Then check disposable voucher
    const { data: voucherDescartavel } = await supabase
      .from('vouchers_descartaveis')
      .select('*')
      .eq('codigo', codigo)
      .maybeSingle();

    if (voucherDescartavel) {
      logger.info('Voucher identificado como descartável');
      return 'descartavel';
    }

    logger.info('Tipo de voucher não identificado');
    return null;
  } catch (error) {
    logger.error('Erro ao identificar tipo de voucher:', error);
    return null;
  }
};

export const validateCommonVoucher = async (codigo) => {
  try {
    logger.info('Validando voucher comum:', codigo);

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
          tipo_turno,
          horario_inicio,
          horario_fim
        )
      `)
      .eq('voucher', codigo)
      .eq('suspenso', false)
      .maybeSingle();

    if (error) throw error;
    
    if (!user) {
      return { success: false, error: 'Voucher comum não encontrado ou usuário suspenso' };
    }

    if (!user.empresas?.ativo) {
      return { success: false, error: 'Empresa inativa' };
    }

    logger.info('Voucher comum válido:', user);
    return { success: true, user };
  } catch (error) {
    logger.error('Erro ao validar voucher comum:', error);
    throw error;
  }
};

export const validateDisposableVoucher = async (codigo) => {
  try {
    const { data: voucher, error } = await supabase
      .from('vouchers_descartaveis')
      .select('*, tipos_refeicao(*)')
      .eq('codigo', codigo)
      .is('usado_em', null)
      .maybeSingle();

    if (error || !voucher) {
      return { success: false, error: 'Voucher descartável inválido ou já utilizado' };
    }

    return { success: true, voucher };
  } catch (error) {
    logger.error('Erro ao validar voucher descartável:', error);
    throw error;
  }
};

export const validateMealTimeAndInterval = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('uso_voucher')
      .select('usado_em')
      .eq('usuario_id', userId)
      .order('usado_em', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return { success: true }; // First usage
    }

    const lastUsage = new Date(data.usado_em);
    const now = new Date();
    const hoursDiff = (now - lastUsage) / (1000 * 60 * 60);

    if (hoursDiff < 3) {
      return { 
        success: false, 
        error: 'Intervalo mínimo entre refeições não respeitado' 
      };
    }

    return { success: true };
  } catch (error) {
    logger.error('Erro ao validar intervalo entre refeições:', error);
    throw error;
  }
};