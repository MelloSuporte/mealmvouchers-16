import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import VoucherForm from './VoucherForm';
import { useMealTypes } from '../../hooks/useMealTypes';
import logger from '../../config/logger';

const VoucherValidationForm = () => {
  const navigate = useNavigate();
  const [isValidating, setIsValidating] = useState(false);
  const { data: mealTypes, isLoading: isLoadingMealTypes } = useMealTypes();
  const [selectedMealType, setSelectedMealType] = useState(null);

  const handleSubmit = async (voucherCode) => {
    if (isValidating) return;
    
    try {
      setIsValidating(true);
      logger.info('Iniciando validação do voucher:', voucherCode);

      if (!selectedMealType) {
        toast.error('Por favor selecione um tipo de refeição');
        return;
      }

      // Primeiro tenta validar como voucher descartável
      const disposableResult = await validateDisposableVoucher(voucherCode, selectedMealType.id);
      
      if (disposableResult.data) {
        // Validar horário da refeição
        const timeValidation = await validateVoucherTime(selectedMealType.id);
        
        if (!timeValidation.is_valid) {
          toast.error(timeValidation.message || 'Fora do horário permitido');
          return;
        }

        localStorage.setItem('disposableVoucher', JSON.stringify({
          code: voucherCode,
          mealTypeId: selectedMealType.id
        }));
        localStorage.setItem('currentMealType', JSON.stringify(selectedMealType));
        navigate('/user-confirmation');
        return;
      }

      // Se não for descartável, tenta validar como voucher comum
      const commonResult = await validateCommonVoucher(voucherCode, selectedMealType.id);
      
      if (commonResult.data) {
        const user = commonResult.data;
        
        // Validar horário do turno
        const currentTime = new Date().toLocaleTimeString('pt-BR', { hour12: false });
        const turno = user.turnos;
        
        if (!(currentTime >= turno.horario_inicio && currentTime <= turno.horario_fim)) {
          toast.error(`Fora do horário do turno (${turno.horario_inicio} - ${turno.horario_fim})`);
          return;
        }

        localStorage.setItem('commonVoucher', JSON.stringify({
          code: voucherCode,
          userName: user.nome || 'Usuário',
          turno: user.turnos?.tipo_turno,
          cpf: user.cpf,
          userId: user.id,
          mealTypeId: selectedMealType.id
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
      mealTypes={mealTypes}
      selectedMealType={selectedMealType}
      onMealTypeChange={setSelectedMealType}
    />
  );
};

export default VoucherValidationForm;