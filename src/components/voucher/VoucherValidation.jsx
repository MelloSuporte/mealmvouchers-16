import { supabase } from '../../config/supabase';
import { logSystemEvent, LOG_TYPES } from '../../utils/systemLogs';
import logger from '../../config/logger';
import { validateCommonVoucher } from './validators/commonVoucherValidator';
import { validateExtraVoucher } from './validators/extraVoucherValidator';
import { validateDisposableVoucher } from './validators/disposableVoucherValidator';

const identifyVoucherType = async (codigo) => {
  try {
    // Garantir que o código seja uma string
    const voucherCode = String(codigo);
    
    // Primeiro tenta encontrar como voucher comum
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('voucher')
      .eq('voucher', voucherCode)
      .single();

    if (usuario) {
      return 'comum';
    }

    // Tenta encontrar como voucher extra
    const { data: voucherExtra } = await supabase
      .from('vouchers_extras')
      .select('*')
      .eq('codigo', voucherCode)
      .single();

    if (voucherExtra) {
      return 'extra';
    }

    // Tenta encontrar como voucher descartável
    const { data: voucherDescartavel } = await supabase
      .from('vouchers_descartaveis')
      .select('*')
      .eq('codigo', voucherCode)
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

    logger.info(`Validando voucher ${tipoVoucher}:`, voucherCode);

    switch (tipoVoucher) {
      case 'comum':
        return await validateCommonVoucher(voucherCode);
      case 'extra':
        return await validateExtraVoucher(voucherCode);
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
        .update({ usado: true, usado_em: new Date().toISOString() })
        .eq('id', voucherId);
    }
  } catch (error) {
    logger.error('Erro ao registrar uso:', error);
    throw error;
  }
};