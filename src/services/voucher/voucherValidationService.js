import { supabase } from '../../config/supabase';
import logger from '../../config/logger';
import { validateCommonVoucher } from '../../components/voucher/validators/commonVoucherValidator';
import { validateDisposableVoucher } from '../../components/voucher/validators/disposableVoucherValidator';

export const validateVoucher = async (codigo, tipoRefeicaoId) => {
  try {
    logger.info('Iniciando validação do voucher:', { codigo, tipoRefeicaoId });
    
    if (!codigo || !tipoRefeicaoId) {
      throw new Error('Código do voucher e tipo de refeição são obrigatórios');
    }

    // Primeiro tenta validar como voucher descartável
    const disposableResult = await validateDisposableVoucher(codigo, tipoRefeicaoId);
    
    if (disposableResult.success) {
      return {
        ...disposableResult,
        voucherType: 'descartavel'
      };
    }

    // Se não for descartável, tenta validar como voucher comum
    const commonResult = await validateCommonVoucher(codigo, tipoRefeicaoId);
    
    if (commonResult.success) {
      return {
        ...commonResult,
        voucherType: 'comum'
      };
    }

    return {
      success: false,
      error: commonResult.error || disposableResult.error || 'Voucher inválido'
    };

  } catch (error) {
    logger.error('Erro na validação:', error);
    return { 
      success: false, 
      error: error.message || 'Erro ao validar voucher'
    };
  }
};