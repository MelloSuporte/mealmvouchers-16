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
    if (!mealTypes) return null;

    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const currentTimeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}:00`;

    return mealTypes.find(type => {
      const startTime = type.horario_inicio;
      const endTime = type.horario_fim;
      const toleranceMinutes = type.minutos_tolerancia || 0;

      // Adiciona tolerância ao horário final
      const [endHour, endMinute] = endTime.split(':').map(Number);
      const endDateTime = new Date();
      endDateTime.setHours(endHour, endMinute + toleranceMinutes, 0);
      const endTimeWithTolerance = `${String(endDateTime.getHours()).padStart(2, '0')}:${String(endDateTime.getMinutes()).padStart(2, '0')}:00`;

      return currentTimeStr >= startTime && currentTimeStr <= endTimeWithTolerance;
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