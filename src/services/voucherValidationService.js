import { supabase } from '../config/supabase';
import logger from '../config/logger';
import { identifyVoucherType } from './voucher/validators/voucherTypeIdentifier';
import { validateDisposableVoucher } from './voucher/validators/disposableVoucherValidator';

export const validateVoucher = async (codigo, tipoRefeicaoId) => {
  try {
    logger.info('Iniciando validação do voucher:', { codigo, tipoRefeicaoId });
    
    // Identificar tipo do voucher
    const voucherType = await identifyVoucherType(codigo);
    logger.info('Tipo de voucher identificado:', voucherType);

    if (!voucherType) {
      return { success: false, error: 'Voucher inválido' };
    }

    // Validar baseado no tipo
    switch (voucherType) {
      case 'descartavel':
        return await validateDisposableVoucher(codigo, tipoRefeicaoId);
      case 'comum':
        return await validateCommonVoucher(codigo, tipoRefeicaoId);
      default:
        return { success: false, error: 'Tipo de voucher não suportado' };
    }
  } catch (error) {
    logger.error('Erro na validação:', error);
    return { 
      success: false, 
      error: error.message || 'Erro ao validar voucher'
    };
  }
};