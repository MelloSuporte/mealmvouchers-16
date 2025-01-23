import { useState } from 'react';
import { validateDisposableVoucher, useDisposableVoucher } from '@/services/voucher/validators/disposableVoucherValidator';
import { toast } from "sonner";
import logger from '@/config/logger';

export const useVoucherValidation = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateVoucher = async (code: string, mealTypeId: string) => {
    try {
      setIsValidating(true);
      setValidationError(null);

      logger.info('Iniciando validação do voucher:', { code, mealTypeId });

      const validationResult = await validateDisposableVoucher(code, mealTypeId);

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

  const useVoucher = async (code: string, mealTypeId: string) => {
    try {
      setIsValidating(true);
      setValidationError(null);

      const result = await useDisposableVoucher(code, mealTypeId);

      if (!result.success) {
        setValidationError(result.error || 'Erro ao usar voucher');
        toast.error(result.error || 'Erro ao usar voucher');
        return false;
      }

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao usar voucher';
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
    validateVoucher,
    useVoucher
  };
};