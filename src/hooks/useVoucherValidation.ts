import { useState } from 'react';
import { validateTimeInterval, validateMealTime } from '@/services/voucher/validators/timeValidator';
import { toast } from "sonner";
import logger from '@/config/logger';

export const useVoucherValidation = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateVoucherTime = async (userId: string, mealTypeId: string): Promise<boolean> => {
    try {
      setIsValidating(true);
      setValidationError(null);

      // Validar intervalo entre refeições
      const intervalResult = await validateTimeInterval(userId);
      if (!intervalResult.success) {
        setValidationError(intervalResult.error);
        toast.error(intervalResult.error);
        return false;
      }

      // Validar horário da refeição
      const mealTimeResult = await validateMealTime(mealTypeId);
      if (!mealTimeResult.success) {
        setValidationError(mealTimeResult.error);
        toast.error(mealTimeResult.error);
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
    validateVoucherTime
  };
};