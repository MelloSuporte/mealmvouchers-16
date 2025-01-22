import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import VoucherForm from './VoucherForm';
import { validateCommonVoucher, validateDisposableVoucher } from '../../services/voucher/voucherValidationService';
import { useMealTypes } from '../../hooks/useMealTypes';
import logger from '../../config/logger';

const VoucherValidationForm = () => {
  const navigate = useNavigate();
  const [isValidating, setIsValidating] = useState(false);
  const { data: mealTypes, isLoading: isLoadingMealTypes } = useMealTypes();

  const getCurrentMealType = (mealTypes) => {
    if (!mealTypes?.length) {
      logger.warn('Nenhum tipo de refeição disponível');
      return null;
    }

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    return mealTypes.find(type => {
      const [startHour, startMinute] = type.horario_inicio.split(':').map(Number);
      const [endHour, endMinute] = type.horario_fim.split(':').map(Number);
      const toleranceMinutes = type.minutos_tolerancia || 0;

      const startTimeInMinutes = startHour * 60 + startMinute;
      const endTimeInMinutes = endHour * 60 + endMinute + toleranceMinutes;

      // Lidar com horários que atravessam a meia-noite
      if (endTimeInMinutes < startTimeInMinutes) {
        return currentTimeInMinutes >= startTimeInMinutes || 
               currentTimeInMinutes <= endTimeInMinutes;
      }

      return currentTimeInMinutes >= startTimeInMinutes && 
             currentTimeInMinutes <= endTimeInMinutes;
    });
  };

  const handleSubmit = async (voucherCode) => {
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

      logger.info('Tipo de refeição atual:', currentMealType);

      // Primeiro tenta validar como voucher descartável
      const disposableResult = await validateDisposableVoucher(voucherCode, currentMealType.id);
      
      if (disposableResult.data) {
        localStorage.setItem('disposableVoucher', JSON.stringify({
          code: voucherCode,
          mealTypeId: currentMealType.id
        }));
        localStorage.setItem('currentMealType', JSON.stringify(currentMealType));
        navigate('/user-confirmation');
        return;
      }

      // Se não for descartável, tenta validar como voucher comum
      const commonResult = await validateCommonVoucher(voucherCode, currentMealType.id);
      
      if (commonResult.data) {
        const user = commonResult.data;
        
        localStorage.setItem('commonVoucher', JSON.stringify({
          code: voucherCode,
          userName: user.nome || 'Usuário',
          turno: user.turnos?.tipo_turno,
          cpf: user.cpf,
          userId: user.id,
          mealTypeId: currentMealType.id
        }));
        navigate('/user-confirmation');
      } else if (commonResult.error) {
        toast.error(commonResult.error);
      } else {
        toast.error('Voucher inválido ou não disponível para uso');
      }
    } catch (error) {
      logger.error('Erro ao validar voucher:', error);
      toast.error(error.message || "Erro ao validar o voucher");
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