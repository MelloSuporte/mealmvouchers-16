import { supabase } from '../../config/supabase';
import logger from '../../config/logger';
import { identifyVoucherType } from './validators/voucherTypeIdentifier';
import { validateDisposableVoucher } from './validators/disposableVoucherValidator';
import { validateCommonVoucher } from './validators/commonVoucherValidator';

export const validateVoucher = async (codigo, tipoRefeicaoId) => {
  try {
    logger.info('Iniciando validação do voucher:', { codigo, tipoRefeicaoId });
    
    // First identify the voucher type
    const voucherType = await identifyVoucherType(codigo);
    logger.info('Tipo de voucher identificado:', voucherType);

    if (!voucherType) {
      logger.warn('Voucher não encontrado:', codigo);
      return { 
        success: false, 
        error: 'Voucher não encontrado ou inválido' 
      };
    }

    // Validate based on type
    switch (voucherType) {
      case 'descartavel':
        return await validateDisposableVoucher(codigo, tipoRefeicaoId);
      case 'comum':
        return await validateCommonVoucher(codigo, tipoRefeicaoId);
      default:
        logger.warn('Tipo de voucher não suportado:', voucherType);
        return { 
          success: false, 
          error: 'Tipo de voucher não suportado' 
        };
    }
  } catch (error) {
    logger.error('Erro na validação:', error);
    return { 
      success: false, 
      error: error.message || 'Erro ao validar voucher'
    };
  }
};