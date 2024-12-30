import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import VoucherForm from './VoucherForm';
import { format } from 'date-fns-tz';
import logger from '../../config/logger';
import { supabase } from '../../config/supabase';
import { identifyVoucherType } from '../../services/voucherValidationService';

export const validateVoucher = async (voucherCode, mealType) => {
  try {
    logger.info('Iniciando validação do voucher:', { voucherCode, mealType });
    
    // Get current time in America/Sao_Paulo timezone
    const currentTime = format(new Date(), 'HH:mm:ss', { timeZone: 'America/Sao_Paulo' });
    logger.info('Current time in São Paulo:', currentTime);

    // Validate and use voucher using RPC function
    const { data, error } = await supabase.rpc('validate_and_use_voucher', {
      p_codigo: voucherCode,
      p_tipo_refeicao_id: mealType
    });

    if (error) {
      logger.error('Erro ao validar voucher:', error);
      
      // Check if error message contains shift time error
      if (error.message?.includes('Fora do horário') || 
          error.message?.includes('horário não permitido')) {
        throw new Error('Fora do Horário de Turno');
      }
      
      throw error;
    }

    if (!data?.success) {
      throw new Error(data?.error || 'Erro ao validar voucher');
    }

    return data;
  } catch (error) {
    logger.error('Erro na validação:', error);
    throw error;
  }
};

const VoucherValidation = () => {
  const navigate = useNavigate();
  const [voucherCode, setVoucherCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isValidating) return;
    
    try {
      setIsValidating(true);
      logger.info('Iniciando validação do voucher:', voucherCode);
      
      // Identificar tipo de voucher
      const voucherType = await identifyVoucherType(voucherCode);
      logger.info('Tipo de voucher identificado:', voucherType);

      if (!voucherType) {
        toast.error('Voucher inválido');
        return;
      }

      // Validar baseado no tipo
      if (voucherType === 'descartavel') {
        const result = await validateVoucher(voucherCode);
        logger.info('Resultado validação voucher descartável:', result);
        
        if (result.success) {
          const { voucher } = result;
          localStorage.setItem('disposableVoucher', JSON.stringify({
            code: voucherCode,
            mealTypeId: voucher.tipo_refeicao_id,
            mealType: voucher.tipos_refeicao.nome
          }));
          navigate('/self-services');
          return;
        }
        toast.error(result.error);
      } else if (voucherType === 'comum') {
        const result = await validateVoucher(voucherCode);
        logger.info('Resultado validação voucher comum:', result);
        
        if (result.success) {
          const { user } = result;
          localStorage.setItem('commonVoucher', JSON.stringify({
            code: voucherCode,
            userName: user.nome,
            turno: user.turnos?.tipo_turno,
            cpf: user.cpf,
            userId: user.id
          }));
          navigate('/self-services');
          return;
        }

        // Check if the error is related to shift time
        if (result.error?.includes('Fora do horário do turno') || 
            result.error === 'Fora do Horário de Turno') {
          toast.error('Fora do Horário de Turno');
          return;
        }
        
        toast.error(result.error);
      } else {
        toast.error('Tipo de voucher não suportado no momento');
      }

    } catch (error) {
      logger.error('Erro ao validar voucher:', error);
      // Check if the error is related to shift time
      if (error.message?.includes('Fora do horário do turno') || 
          error.message === 'Fora do Horário de Turno') {
        toast.error('Fora do Horário de Turno');
        return;
      }
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

export default VoucherValidation;