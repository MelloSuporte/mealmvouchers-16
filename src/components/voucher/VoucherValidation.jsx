import { supabase } from '../../config/supabase';
import { logSystemEvent, LOG_TYPES } from '../../utils/systemLogs';
import logger from '../../config/logger';
import { VOUCHER_TYPES } from '../../services/voucher/voucherTypes';
import { 
  findVoucherComum,
  findVoucherExtra, 
  findVoucherDescartavel 
} from '../../services/voucher/voucherQueries';
import {
  validateVoucherTime,
  validateVoucherUsage,
  registerVoucherUsage
} from '../../services/voucher/voucherValidation';

export const identifyVoucherType = async (codigo) => {
  try {
    logger.info('Identificando tipo de voucher:', codigo);
    
    // Garantir que o código seja uma string
    const voucherCode = String(codigo);
    
    // Primeiro tenta encontrar como voucher comum
    const usuario = await findVoucherComum(voucherCode);
    if (usuario) {
      logger.info('Voucher identificado como comum');
      return VOUCHER_TYPES.COMUM;
    }

    // Tenta encontrar como voucher extra
    const voucherExtra = await findVoucherExtra(voucherCode);
    if (voucherExtra) {
      logger.info('Voucher identificado como extra');
      return VOUCHER_TYPES.EXTRA;
    }

    // Tenta encontrar como voucher descartável
    const voucherDescartavel = await findVoucherDescartavel(voucherCode);
    if (voucherDescartavel) {
      logger.info('Voucher identificado como descartável');
      return VOUCHER_TYPES.DESCARTAVEL;
    }

    logger.info('Tipo de voucher não identificado');
    return null;
  } catch (error) {
    logger.error('Erro ao identificar tipo de voucher:', error);
    return null;
  }
};

export const validateVoucher = async (codigo, tipoRefeicaoId) => {
  try {
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

    // Buscar dados do voucher
    let voucher = null;
    let userId = null;
    let turnoId = null;

    switch (tipoVoucher) {
      case VOUCHER_TYPES.COMUM:
        voucher = await findVoucherComum(voucherCode);
        userId = voucher?.id;
        turnoId = voucher?.turno_id;
        break;
      case VOUCHER_TYPES.EXTRA:
        voucher = await findVoucherExtra(voucherCode);
        userId = voucher?.usuario_id;
        turnoId = voucher?.turno_id;
        break;
      case VOUCHER_TYPES.DESCARTAVEL:
        voucher = await findVoucherDescartavel(voucherCode);
        break;
    }

    if (!voucher) {
      throw new Error('Voucher não encontrado ou já utilizado');
    }

    // Validar horário se não for descartável
    if (tipoVoucher !== VOUCHER_TYPES.DESCARTAVEL) {
      const timeValid = await validateVoucherTime(tipoRefeicaoId, turnoId);
      if (!timeValid) {
        throw new Error('Horário não permitido para esta refeição');
      }

      // Validar regras de uso
      await validateVoucherUsage(userId, tipoRefeicaoId);
    }

    return { 
      success: true, 
      voucher,
      tipoVoucher,
      userId
    };
  } catch (error) {
    logger.error('Erro na validação:', error);
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