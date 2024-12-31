import { supabase } from '../config/supabase';
import logger from '../config/logger';

export const identifyVoucherType = async (codigo) => {
  try {
    logger.info('Identificando tipo de voucher:', codigo);
    
    // Garantir que o código seja uma string
    const voucherCode = String(codigo);
    
    // Verificar primeiro se é um voucher descartável
    const { data: voucherDescartavel, error: errorDescartavel } = await supabase
      .from('vouchers_descartaveis')
      .select('*')
      .eq('codigo', voucherCode)
      .is('usado_em', null)
      .is('data_uso', null)
      .gte('data_expiracao', new Date().toISOString())
      .maybeSingle(); // Usar maybeSingle ao invés de single

    if (errorDescartavel) {
      logger.error('Erro ao buscar voucher descartável:', errorDescartavel);
    } else if (voucherDescartavel) {
      logger.info('Voucher identificado como descartável');
      return 'descartavel';
    }

    // Verificar se é um voucher comum
    const { data: usuario, error: errorUsuario } = await supabase
      .from('usuarios')
      .select('voucher')
      .eq('voucher', voucherCode)
      .maybeSingle(); // Usar maybeSingle ao invés de single

    if (errorUsuario) {
      logger.error('Erro ao buscar voucher comum:', errorUsuario);
    } else if (usuario) {
      logger.info('Voucher identificado como comum');
      return 'comum';
    }

    // Verificar se é um voucher extra
    const { data: voucherExtra, error: errorExtra } = await supabase
      .from('vouchers_extras')
      .select('*')
      .eq('codigo', voucherCode)
      .maybeSingle(); // Usar maybeSingle ao invés de single

    if (errorExtra) {
      logger.error('Erro ao buscar voucher extra:', errorExtra);
    } else if (voucherExtra) {
      logger.info('Voucher identificado como extra');
      return 'extra';
    }

    logger.info('Tipo de voucher não identificado');
    return null;
  } catch (error) {
    logger.error('Erro ao identificar tipo de voucher:', error);
    return null;
  }
};

export const validateDisposableVoucher = async (codigo) => {
  try {
    const { data: voucher, error } = await supabase
      .from('vouchers_descartaveis')
      .select('*, tipos_refeicao(*)')
      .eq('codigo', String(codigo))
      .is('usado_em', null)
      .is('data_uso', null)
      .gte('data_expiracao', new Date().toISOString())
      .maybeSingle(); // Usar maybeSingle ao invés de single

    if (error) {
      logger.info('Voucher não encontrado ou já utilizado');
      return { success: false, error: 'Voucher descartável inválido ou já utilizado' };
    }

    if (!voucher) {
      return { success: false, error: 'Voucher não encontrado' };
    }

    // Verificar tipo de refeição
    if (!voucher.tipos_refeicao?.ativo) {
      return { success: false, error: 'Tipo de refeição inativo' };
    }

    return { success: true, voucher };
  } catch (error) {
    logger.error('Erro ao validar voucher descartável:', error);
    throw error;
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

export const validateExtraVoucher = async (codigo) => {
  try {
    const { data: extraVoucher, error } = await supabase
      .from('vouchers_extras')
      .select('*')
      .eq('codigo', codigo)
      .single();

    if (error || !extraVoucher) {
      return { success: false, error: 'Voucher extra não encontrado ou inválido' };
    }

    if (extraVoucher.is_used) {
      return { success: false, error: 'Voucher extra já utilizado' };
    }

    return { success: true, extraVoucher };
  } catch (error) {
    logger.error('Erro ao validar voucher extra:', error);
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
