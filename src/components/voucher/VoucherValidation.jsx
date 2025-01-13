import { supabase } from '../../config/supabase';
import logger from '../../config/logger';
import { logSystemEvent, LOG_TYPES } from '../../utils/systemLogs';

const validateDisposableVoucher = async (codigo, tipoRefeicaoId) => {
  const { data, error } = await supabase
    .rpc('validate_and_use_voucher', {
      p_codigo: codigo,
      p_tipo_refeicao_id: tipoRefeicaoId
    });

  if (error) {
    logger.error('Erro na validação do voucher descartável:', error);
    return { 
      success: false, 
      error: error.message,
      voucherType: 'descartavel'
    };
  }

  return { 
    success: true,
    voucherType: 'descartavel',
    message: 'Voucher descartável validado com sucesso'
  };
};

const validateCommonVoucher = async (codigo, tipoRefeicaoId, usuario) => {
  const { data, error } = await supabase
    .rpc('validate_and_use_voucher', {
      p_codigo: codigo,
      p_tipo_refeicao_id: tipoRefeicaoId
    });

  if (error) {
    logger.error('Erro na validação:', error);
    return { 
      success: false, 
      error: error.message,
      voucherType: 'comum'
    };
  }

  return {
    success: true,
    voucherType: 'comum',
    user: usuario,
    message: 'Voucher comum validado com sucesso'
  };
};

const findDisposableVoucher = async (codigo) => {
  return await supabase
    .from('vouchers_descartaveis')
    .select('*')
    .eq('codigo', codigo)
    .single();
};

const findCommonVoucher = async (codigo) => {
  return await supabase
    .from('usuarios')
    .select('*')
    .eq('voucher', codigo)
    .single();
};

export const validateVoucher = async (codigo, tipoRefeicaoId) => {
  try {
    await logSystemEvent({
      tipo: LOG_TYPES.TENTATIVA_VALIDACAO,
      mensagem: `Iniciando validação do voucher: ${codigo}`,
      detalhes: { codigo, tipoRefeicaoId }
    });

    logger.info('Iniciando validação do voucher:', { 
      voucherCode: codigo, 
      mealType: tipoRefeicaoId 
    });

    // Garantir que o código seja uma string
    const voucherCode = String(codigo);
    
    // Tentar validar como voucher descartável primeiro
    const { data: voucherDescartavel } = await findDisposableVoucher(voucherCode);

    if (voucherDescartavel) {
      logger.info('Voucher identificado como descartável');
      return await validateDisposableVoucher(voucherCode, tipoRefeicaoId);
    }

    // Se não for descartável, tentar como voucher comum
    const { data: usuario } = await findCommonVoucher(voucherCode);

    if (usuario) {
      logger.info('Voucher identificado como comum');
      return await validateCommonVoucher(voucherCode, tipoRefeicaoId, usuario);
    }

    logger.info('Tipo de voucher não identificado');
    return { success: false, error: 'Voucher inválido' };

  } catch (error) {
    logger.error('Erro na validação do voucher:', error);
    await logSystemEvent({
      tipo: LOG_TYPES.ERRO_VALIDACAO_VOUCHER,
      mensagem: 'Erro na validação',
      detalhes: error,
      nivel: 'error'
    });
    return { 
      success: false, 
      error: error.message || 'Erro ao validar voucher'
    };
  }
};