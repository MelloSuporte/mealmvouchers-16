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

      if (!result.user.id || !mealType) {
        throw new Error('Dados inválidos para registro de uso do voucher');
      }

      try {
        // Register usage
        const usageResult = await registerVoucherUsage({
          userId: result.user.id,
          tipoRefeicaoId: mealType,
          tipoVoucher: 'comum'
        });

        if (!usageResult.success) {
          // Parse error message from Supabase response if available
          let errorMessage = usageResult.error || 'Erro ao registrar uso do voucher';
          try {
            const errorBody = JSON.parse(usageResult.body);
            if (errorBody?.message?.includes('Fora do horário do turno')) {
              throw new Error('Fora do Horário de Turno');
            }
          } catch (parseError) {
            // If parsing fails, use the original error message
            if (errorMessage.includes('Fora do horário do turno')) {
              throw new Error('Fora do Horário de Turno');
            }
          }
          throw new Error(errorMessage);
        }

        return { success: true };
      } catch (error) {
        // Handle specific error messages from the backend
        if (error.message?.includes('Fora do horário do turno') || 
            error.message === 'Fora do Horário de Turno') {
          throw new Error('Fora do Horário de Turno');
        }
        throw error;
      }
    } 
    else if (voucherType === 'descartavel') {
      const result = await validateDisposableVoucher(voucherCode);
      if (!result.success) {
        throw new Error(result.error);
      }

      if (!result.voucher.id || !mealType) {
        throw new Error('Dados inválidos para registro de uso do voucher');
      }

      // Register usage
      const usageResult = await registerVoucherUsage({
        tipoRefeicaoId: mealType,
        tipoVoucher: 'descartavel',
        voucherDescartavelId: result.voucher.id
      });

      if (!usageResult.success) {
        throw new Error(usageResult.error || 'Erro ao registrar uso do voucher');
      }

      return { success: true };
    }

    throw new Error('Tipo de voucher não suportado');

  } catch (error) {
    logger.error('Erro na validação do voucher:', error);
    // Format the error message for display
    const errorMessage = error.message === 'Fora do Horário de Turno' 
      ? error.message 
      : error.message || 'Erro ao validar voucher';
    throw new Error(errorMessage);
  }
};