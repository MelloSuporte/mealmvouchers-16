import { supabase } from '../../config/supabase';
import { logSystemEvent, LOG_TYPES } from '../../utils/systemLogs';
import logger from '../../config/logger';

const identifyVoucherType = async (codigo) => {
  try {
    // Primeiro tenta encontrar como voucher comum
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('voucher')
      .eq('voucher', codigo)
      .single();

    if (usuario) {
      return 'comum';
    }

    // Tenta encontrar como voucher extra
    const { data: voucherExtra } = await supabase
      .from('vouchers_extras')
      .select('*')
      .eq('codigo', codigo)
      .single();

    if (voucherExtra) {
      return 'extra';
    }

    // Tenta encontrar como voucher descartável
    const { data: voucherDescartavel } = await supabase
      .from('vouchers_descartaveis')
      .select('*')
      .eq('codigo', codigo)
      .single();

    if (voucherDescartavel) {
      return 'descartavel';
    }

    return null;
  } catch (error) {
    logger.error('Erro ao identificar tipo de voucher:', error);
    return null;
  }
};

export const validateVoucher = async (codigo, tipoRefeicaoId) => {
  try {
    // Log da tentativa de validação
    await logSystemEvent({
      tipo: LOG_TYPES.TENTATIVA_VALIDACAO,
      mensagem: `Iniciando validação do voucher: ${codigo}`,
      detalhes: { codigo, tipoRefeicaoId }
    });

    // Garantir que o código seja uma string
    const voucherCode = String(codigo);
    
    // Identificar o tipo de voucher
    const tipoVoucher = await identifyVoucherType(voucherCode);
    
    if (!tipoVoucher) {
      await logSystemEvent({
        tipo: LOG_TYPES.VALIDACAO_FALHA,
        mensagem: 'Voucher não encontrado',
        detalhes: { codigo: voucherCode }
      });
      return { success: false, error: 'Voucher inválido' };
    }

    logger.info(`Tipo de voucher identificado: ${tipoVoucher}`);

    switch (tipoVoucher) {
      case 'comum':
        return await validateCommonVoucher(voucherCode, tipoRefeicaoId);
      case 'extra':
        return await validateExtraVoucher(voucherCode, tipoRefeicaoId);
      case 'descartavel':
        return await validateDisposableVoucher(voucherCode, tipoRefeicaoId);
      default:
        throw new Error('Tipo de voucher não reconhecido');
    }
  } catch (error) {
    logger.error('Erro na validação:', error);
    await logSystemEvent({
      tipo: LOG_TYPES.ERRO_VALIDACAO_VOUCHER,
      mensagem: 'Erro na validação',
      detalhes: error,
      nivel: 'error'
    });
    throw error;
  }
};

const validateCommonVoucher = async (codigo, tipoRefeicaoId) => {
  const { data: usuario, error: errorUsuario } = await supabase
    .from('usuarios')
    .select('*, empresas(*), turnos(*)')
    .eq('voucher', codigo)
    .single();

  if (errorUsuario || !usuario) {
    return { success: false, error: 'Voucher comum inválido' };
  }

  // Verificar se o usuário está suspenso
  if (usuario.suspenso) {
    return { success: false, error: 'Usuário suspenso' };
  }

  // Verificar se a empresa está ativa
  if (!usuario.empresas?.ativo) {
    return { success: false, error: 'Empresa inativa' };
  }

  return { success: true, user: usuario };
};

const validateExtraVoucher = async (codigo, tipoRefeicaoId) => {
  const { data: voucher, error } = await supabase
    .from('vouchers_extras')
    .select('*, usuarios(*)')
    .eq('codigo', codigo)
    .single();

  if (error || !voucher) {
    return { success: false, error: 'Voucher extra inválido' };
  }

  // Verificar se já foi usado
  if (voucher.usado) {
    return { success: false, error: 'Voucher extra já utilizado' };
  }

  // Verificar validade
  if (new Date(voucher.valido_ate) < new Date()) {
    return { success: false, error: 'Voucher extra expirado' };
  }

  return { success: true, voucher };
};

const validateDisposableVoucher = async (codigo, tipoRefeicaoId) => {
  const { data: voucher, error } = await supabase
    .from('vouchers_descartaveis')
    .select('*, tipos_refeicao(*)')
    .eq('codigo', codigo)
    .single();

  if (error || !voucher) {
    return { success: false, error: 'Voucher descartável inválido' };
  }

  // Verificar se já foi usado
  if (voucher.usado) {
    return { success: false, error: 'Voucher descartável já utilizado' };
  }

  // Verificar validade
  if (new Date(voucher.data_expiracao) < new Date()) {
    return { success: false, error: 'Voucher descartável expirado' };
  }

  // Verificar tipo de refeição
  if (voucher.tipo_refeicao_id !== tipoRefeicaoId) {
    return { success: false, error: 'Tipo de refeição inválido para este voucher' };
  }

  return { success: true, voucher };
};

export const registerVoucherUsage = async ({
  userId,
  mealType,
  mealName,
  voucherType,
  voucherId
}) => {
  try {
    const usageData = {
      usuario_id: userId,
      tipo_refeicao_id: mealType,
      usado_em: new Date().toISOString(),
      observacao: `Refeição: ${mealName} (${voucherType})`
    };

    // Adicionar campos específicos baseado no tipo de voucher
    if (voucherType === 'extra') {
      usageData.voucher_extra_id = voucherId;
    } else if (voucherType === 'descartavel') {
      usageData.voucher_descartavel_id = voucherId;
    }

    const { error: usageError } = await supabase
      .from('uso_voucher')
      .insert([usageData]);

    if (usageError) {
      logger.error('Erro ao registrar uso:', usageError);
      throw new Error('Erro ao registrar uso do voucher');
    }

    // Atualizar status do voucher se for extra ou descartável
    if (voucherType === 'extra') {
      await supabase
        .from('vouchers_extras')
        .update({ usado: true, usado_em: new Date().toISOString() })
        .eq('id', voucherId);
    } else if (voucherType === 'descartavel') {
      await supabase
        .from('vouchers_descartaveis')
        .update({ usado: true, data_uso: new Date().toISOString() })
        .eq('id', voucherId);
    }
  } catch (error) {
    logger.error('Erro ao registrar uso:', error);
    throw error;
  }
};