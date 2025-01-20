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

  const validateMealTime = (mealType, userTurno) => {
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();

    const [startHour, startMinute] = mealType.horario_inicio.split(':').map(Number);
    const [endHour, endMinute] = mealType.horario_fim.split(':').map(Number);
    const toleranceMinutes = mealType.minutos_tolerancia || 15;

    const mealStartTime = new Date();
    mealStartTime.setHours(startHour, startMinute, 0);

    const mealEndTime = new Date();
    mealEndTime.setHours(endHour, endMinute + toleranceMinutes, 0);

    if (currentTime < mealStartTime || currentTime > mealEndTime) {
      throw new Error(`Esta refeição só pode ser utilizada entre ${mealType.horario_inicio} e ${mealType.horario_fim} (+ ${toleranceMinutes} min de tolerância)`);
    }

    // Validar horário do turno do usuário
    if (userTurno) {
      const [shiftStartHour, shiftStartMinute] = userTurno.horario_inicio.split(':').map(Number);
      const [shiftEndHour, shiftEndMinute] = userTurno.horario_fim.split(':').map(Number);

      const shiftStartTime = new Date();
      shiftStartTime.setHours(shiftStartHour, shiftStartMinute, 0);

      const shiftEndTime = new Date();
      shiftEndTime.setHours(shiftEndHour, shiftEndMinute, 0);

      if (currentTime < shiftStartTime || currentTime > shiftEndTime) {
        throw new Error(`Fora do horário do turno (${userTurno.horario_inicio} - ${userTurno.horario_fim})`);
      }
    }
  };

  const validateDailyLimit = async (userId) => {
    const today = new Date().toISOString().split('T')[0];
    const { data: usageCount, error: usageError } = await supabase
      .from('uso_voucher')
      .select('count', { count: 'exact' })
      .eq('usuario_id', userId)
      .gte('usado_em', today);

    if (usageError) {
      logger.error('Erro ao verificar limite diário:', usageError);
      throw usageError;
    }

    if (usageCount >= 3) {
      throw new Error('Limite diário de refeições atingido (máximo 3)');
    }
  };

  const validateMealInterval = async (userId) => {
    const { data: lastUsage } = await supabase
      .from('uso_voucher')
      .select('usado_em')
      .eq('usuario_id', userId)
      .order('usado_em', { ascending: false })
      .limit(1)
      .single();

    if (lastUsage) {
      const lastUsageTime = new Date(lastUsage.usado_em);
      const currentDateTime = new Date();
      const hoursDiff = (currentDateTime - lastUsageTime) / (1000 * 60 * 60);

      if (hoursDiff < 3) {
        throw new Error('É necessário aguardar 3 horas entre as refeições');
      }
    }
  };

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

      // Tentar validar como voucher descartável
      const disposableResult = await findDisposableVoucher(voucherCode);
      
      if (disposableResult.data) {
        // Validar horário da refeição para voucher descartável
        validateMealTime(currentMealType);

        localStorage.setItem('disposableVoucher', JSON.stringify({
          code: voucherCode,
          mealTypeId: currentMealType.id
        }));
        localStorage.setItem('currentMealType', JSON.stringify(currentMealType));
        navigate('/user-confirmation');
        return;
      }

      // Tentar validar como voucher comum
      const commonResult = await findCommonVoucher(voucherCode);
      
      if (commonResult.data) {
        const user = commonResult.data.usuarios;
        
        // Validar status do usuário
        if (user.suspenso) {
          toast.error('Usuário suspenso');
          return;
        }

        // Validar status da empresa
        if (!user.empresas?.ativo) {
          toast.error('Empresa inativa');
          return;
        }

        // Validar horário da refeição e turno
        validateMealTime(currentMealType, user.turnos);

        // Validar limite diário
        await validateDailyLimit(user.id);

        // Validar intervalo mínimo entre refeições
        await validateMealInterval(user.id);

        localStorage.setItem('commonVoucher', JSON.stringify({
          code: voucherCode,
          userName: user.nome || 'Usuário',
          turno: user.turnos?.tipo_turno,
          cpf: user.cpf,
          userId: user.id
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