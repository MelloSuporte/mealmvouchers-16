import { supabase } from '../../config/supabase';
import logger from '../../config/logger';
import { logSystemEvent, LOG_TYPES } from '../../utils/systemLogs';
import { identifyVoucherType } from '../../services/voucher/validators/voucherTypeIdentifier';
import { validateCommonVoucher } from './validators/commonVoucherValidator';
import { validateExtraVoucher } from './validators/extraVoucherValidator';
import { validateDisposableVoucher } from './validators/disposableVoucherValidator';
import { registerVoucherUsage } from '../../services/voucher/voucherUsageService';

export const validateVoucher = async (codigo, tipoRefeicaoId) => {
  try {
    await logSystemEvent({
      tipo: LOG_TYPES.TENTATIVA_VALIDACAO,
      mensagem: `Iniciando validação do voucher: ${codigo}`,
      detalhes: { codigo, tipoRefeicaoId }
    });

    const voucherCode = String(codigo);
    const tipoVoucher = await identifyVoucherType(voucherCode);
    
    if (!tipoVoucher) {
      await logSystemEvent({
        tipo: LOG_TYPES.VALIDACAO_FALHA,
        mensagem: 'Voucher não encontrado',
        detalhes: { codigo: voucherCode }
      });
      return { success: false, error: 'Voucher inválido' };
    }

    let voucher = null;
    let userId = null;
    let voucherId = null;

    switch (tipoVoucher) {
      case 'comum': {
        const resultComum = await validateCommonVoucher(voucherCode);
        if (!resultComum.success) return resultComum;
        voucher = resultComum.user;
        userId = voucher?.id;
        break;
      }
      case 'extra': {
        const resultExtra = await validateExtraVoucher(voucherCode);
        if (!resultExtra.success) return resultExtra;
        voucher = resultExtra.voucher;
        userId = voucher?.usuario_id;
        voucherId = voucher?.id;
        break;
      }
      case 'descartavel': {
        const resultDescartavel = await validateDisposableVoucher(voucherCode);
        if (!resultDescartavel.success) return resultDescartavel;
        voucher = resultDescartavel.voucher;
        voucherId = voucher?.id;
        break;
      }
    }

    if (!voucher) {
      throw new Error('Voucher não encontrado ou já utilizado');
    }

    await registerVoucherUsage(userId, tipoRefeicaoId, tipoVoucher, voucherId);

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