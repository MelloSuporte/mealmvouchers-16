import React from 'react';
import { toast } from "sonner";
import logger from '../../config/logger';
import { registerVoucherUsage } from '../../services/voucher/voucherUsageService';
import { 
  identifyVoucherType,
  validateCommonVoucher,
  validateDisposableVoucher,
  validateMealTimeAndInterval
} from '../../services/voucherValidationService';

export const validateVoucher = async (voucherCode, mealType) => {
  try {
    logger.info('Iniciando validação do voucher:', voucherCode);

    // Identify voucher type
    const voucherType = await identifyVoucherType(voucherCode);
    
    if (!voucherType) {
      throw new Error('Voucher não encontrado ou inválido');
    }

    // Validate based on type
    if (voucherType === 'comum') {
      const result = await validateCommonVoucher(voucherCode);
      if (!result.success) {
        throw new Error(result.error);
      }

      // Validate meal time and interval
      const intervalResult = await validateMealTimeAndInterval(result.user.id);
      if (!intervalResult.success) {
        throw new Error(intervalResult.error);
      }

      // Register usage
      const usageResult = await registerVoucherUsage(
        result.user.id,
        mealType,
        'comum'
      );

      if (!usageResult.success) {
        throw new Error(usageResult.error);
      }

      return { success: true };
    } 
    else if (voucherType === 'descartavel') {
      const result = await validateDisposableVoucher(voucherCode);
      if (!result.success) {
        throw new Error(result.error);
      }

      // Register usage
      const usageResult = await registerVoucherUsage(
        null,
        mealType,
        'descartavel',
        result.voucher.id
      );

      if (!usageResult.success) {
        throw new Error(usageResult.error);
      }

      return { success: true };
    }

    throw new Error('Tipo de voucher não suportado');

  } catch (error) {
    logger.error('Erro na validação do voucher:', error);
    throw error;
  }
};