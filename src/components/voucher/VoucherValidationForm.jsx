import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import VoucherForm from './VoucherForm';
import { supabase } from '../../config/supabase';
import { validateVoucher } from '../../services/voucherValidationService';
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
          .gte('horario_fim', currentTime)
          .lte('horario_inicio', currentTime);

        if (mealTypesError) {
          console.error('Erro ao buscar tipo de refeição:', mealTypesError);
          return;
        }

        if (mealTypes && mealTypes.length > 0) {
          setCurrentMealType(mealTypes[0]);
        }
      } catch (error) {
        console.error('Erro ao determinar tipo de refeição:', error);
      }
    };

    getCurrentMealType();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isValidating) return;
    
    try {
      setIsValidating(true);
      console.log('Iniciando validação do voucher:', voucherCode);

      if (!currentMealType) {
        toast.error('Nenhum tipo de refeição disponível neste horário');
        return;
      }

      const result = await validateVoucher(voucherCode, currentMealType.id);
      
      if (result.success) {
        navigate('/self-services');
      } else {
        toast.error(result.error || 'Erro ao validar voucher');
      }
    } catch (error) {
      console.error('Erro ao validar voucher:', error);
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