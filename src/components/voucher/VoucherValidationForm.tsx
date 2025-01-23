import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import VoucherForm from './VoucherForm';
import { useVoucherValidation } from '@/hooks/useVoucherValidation';
import { useMealTypes } from '@/hooks/useMealTypes';
import logger from '@/config/logger';

const VoucherValidationForm = () => {
  const navigate = useNavigate();
  const [isValidating, setIsValidating] = useState(false);
  const { validateVoucherCode } = useVoucherValidation();
  const { data: mealTypes, isLoading: isLoadingMealTypes } = useMealTypes();

  const getCurrentMealType = (mealTypes: any[]) => {
    if (!mealTypes?.length) {
      logger.warn('Nenhum tipo de refeição disponível');
      return null;
    }

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    logger.info('Buscando tipo de refeição para horário:', { 
      hora: currentHour, 
      minuto: currentMinute 
    });

    const availableMealType = mealTypes.find(type => {
      const [startHour, startMinute] = type.horario_inicio.split(':').map(Number);
      const [endHour, endMinute] = type.horario_fim.split(':').map(Number);
      const toleranceMinutes = type.minutos_tolerancia || 0;

      const startTimeInMinutes = startHour * 60 + startMinute;
      let endTimeInMinutes = endHour * 60 + endMinute + toleranceMinutes;

      const isWithinTime = currentTimeInMinutes >= startTimeInMinutes && 
                          currentTimeInMinutes <= endTimeInMinutes;

      if (isWithinTime) {
        logger.info('Tipo de refeição encontrado:', {
          nome: type.nome,
          inicio: type.horario_inicio,
          fim: type.horario_fim,
          tolerancia: type.minutos_tolerancia
        });
      }

      return isWithinTime;
    });

    if (!availableMealType) {
      logger.warn('Nenhum tipo de refeição disponível para o horário atual');
    }

    return availableMealType;
  };

  const handleSubmit = async (voucherCode: string) => {
    if (isValidating) return;
    
    try {
      setIsValidating(true);
      logger.info('Iniciando validação do voucher:', voucherCode);

      if (isLoadingMealTypes || !mealTypes) {
        toast.error('Carregando tipos de refeição...');
        return;
      }

      const currentMealType = getCurrentMealType(mealTypes);
      
      if (!currentMealType) {
        toast.error('Fora do horário de refeições');
        return;
      }

      logger.info('Validando voucher com tipo de refeição:', {
        id: currentMealType.id,
        nome: currentMealType.nome
      });

      const isValid = await validateVoucherCode({
        code: voucherCode,
        mealTypeId: currentMealType.id
      });
      
      if (isValid) {
        localStorage.setItem('currentMealType', JSON.stringify(currentMealType));
        navigate('/user-confirmation');
      }
    } catch (error) {
      logger.error('Erro ao validar voucher:', error);
      toast.error("Erro ao validar o voucher");
    } finally {
      setIsValidating(false);
    }
  };

  if (isLoadingMealTypes) {
    return <div>Carregando tipos de refeição...</div>;
  }

  return (
    <VoucherForm
      onSubmit={handleSubmit}
      isSubmitting={isValidating}
    />
  );
};

export default VoucherValidationForm;