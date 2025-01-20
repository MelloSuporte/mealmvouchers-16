import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import VoucherForm from './VoucherForm';
import { findCommonVoucher } from './validators/commonVoucherValidator';
import { findDisposableVoucher } from './validators/disposableVoucherValidator';
import { supabase } from '../../config/supabase';
import logger from '../../config/logger';

const VoucherValidationForm = () => {
  const navigate = useNavigate();
  const [voucherCode, setVoucherCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [currentMealType, setCurrentMealType] = useState(null);

  useEffect(() => {
    const getCurrentMealType = async () => {
      try {
        const currentTime = new Date().toLocaleTimeString('pt-BR', { hour12: false });
        const { data: mealTypes, error: mealTypesError } = await supabase
          .from('tipos_refeicao')
          .select('*')
          .eq('ativo', true)
          .lte('horario_inicio', currentTime)
          .gte('horario_fim', currentTime);

        if (mealTypesError) {
          logger.error('Erro ao buscar tipo de refeição:', mealTypesError);
          return;
        }

        if (mealTypes && mealTypes.length > 0) {
          setCurrentMealType(mealTypes[0]);
        }
      } catch (error) {
        logger.error('Erro ao determinar tipo de refeição:', error);
      }
    };

    getCurrentMealType();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isValidating) return;
    
    try {
      setIsValidating(true);
      logger.info('Iniciando validação do voucher:', voucherCode);

      if (!currentMealType) {
        toast.error('Nenhum tipo de refeição disponível neste horário');
        return;
      }

      // Tentar validar como voucher descartável primeiro
      const disposableResult = await findDisposableVoucher(voucherCode);
      
      if (disposableResult.data) {
        localStorage.setItem('disposableVoucher', JSON.stringify({
          code: voucherCode,
          mealTypeId: currentMealType.id
        }));
        localStorage.setItem('currentMealType', JSON.stringify(currentMealType));
        navigate('/user-confirmation');
        return;
      }

      // Se não for descartável, tentar como voucher comum
      const commonResult = await findCommonVoucher(voucherCode);
      
      if (commonResult.data) {
        localStorage.setItem('commonVoucher', JSON.stringify({
          code: voucherCode,
          userName: commonResult.data.usuarios?.nome || 'Usuário',
          turno: commonResult.data.usuarios?.turnos?.tipo_turno,
          cpf: commonResult.data.usuarios?.cpf,
          userId: commonResult.data.usuarios?.id
        }));
        localStorage.setItem('currentMealType', JSON.stringify(currentMealType));
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

  return (
    <VoucherForm
      voucherCode={voucherCode}
      onSubmit={handleSubmit}
      onNumpadClick={(num) => setVoucherCode(prev => prev.length < 4 ? prev + num : prev)}
      onBackspace={() => setVoucherCode(prev => prev.slice(0, -1))}
      isValidating={isValidating}
    />
  );
};

export default VoucherValidationForm;