import { useState } from 'react';
import { validateVoucher } from '@/services/voucher/validators/voucherValidationService';
import { toast } from "sonner";
import logger from '@/config/logger';
import { VoucherValidationParams, ValidationResult } from '@/types/voucher';

export const useVoucherValidation = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateVoucherCode = async (params: VoucherValidationParams): Promise<boolean> => {
    try {
      setIsValidating(true);
      setValidationError(null);

      logger.info('Iniciando validação do voucher:', params);

      const validationResult = await validateVoucher(params);

      if (!validationResult.success) {
        setValidationError(validationResult.error || 'Erro na validação do voucher');
        toast.error(validationResult.error || 'Erro na validação do voucher');
        return false;
      }

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao validar voucher';
      setValidationError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  return {
    isValidating,
    validationError,
    validateVoucherCode
  };
};