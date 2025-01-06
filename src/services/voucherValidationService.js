import { supabase } from '../config/supabase';
import logger from '../config/logger';

export const validateDisposableVoucher = async (codigo, tipoRefeicaoId) => {
  try {
    logger.info('Iniciando validação do voucher descartável:', { codigo, tipoRefeicaoId });

    const { data, error } = await supabase
      .rpc('validate_disposable_voucher', {
        p_codigo: codigo,
        p_tipo_refeicao_id: tipoRefeicaoId
      });

    if (error) {
      logger.error('Erro ao validar voucher descartável:', error);
      throw error;
    }

    logger.info('Resultado da validação:', data);
    return data;

  } catch (error) {
    logger.error('Erro ao validar voucher descartável:', error);
    throw error;
  }
};

export const validateCommonVoucher = async (codigo, tipoRefeicaoId) => {
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

export const identifyVoucherType = async (codigo) => {
  try {
    logger.info('Identificando tipo de voucher:', codigo);
    
    // Garantir que o código seja uma string
    const voucherCode = String(codigo);
    
    // Verificar primeiro se é um voucher descartável
    const { data: voucherDescartavel } = await supabase
      .from('vouchers_descartaveis')
      .select('*')
      .eq('codigo', voucherCode)
      .is('usado_em', null)
      .gte('data_expiracao', new Date().toISOString().split('T')[0])
      .maybeSingle();

    if (voucherDescartavel) {
      logger.info('Voucher identificado como descartável');
      return 'descartavel';
    }

    // Verificar se é um voucher comum
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('voucher')
      .eq('voucher', voucherCode)
      .maybeSingle();

    if (usuario) {
      logger.info('Voucher identificado como comum');
      return 'comum';
    }

    logger.info('Tipo de voucher não identificado');
    return null;
  } catch (error) {
    logger.error('Erro ao identificar tipo de voucher:', error);
    return null;
  }
};