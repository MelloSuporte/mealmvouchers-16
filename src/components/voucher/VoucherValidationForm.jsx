import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import VoucherForm from './VoucherForm';
import { validateCommonVoucher, validateDisposableVoucher, validateVoucherTime } from '../../services/voucher/voucherValidationService';
import logger from '../../config/logger';

const VoucherValidationForm = () => {
  const navigate = useNavigate();
  const [voucherCode, setVoucherCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isValidating) return;
    
    try {
      setIsValidating(true);
      logger.info('Iniciando validação do voucher:', voucherCode);

      // Primeiro tenta validar como voucher descartável
      const disposableResult = await validateDisposableVoucher(voucherCode);
      
      if (disposableResult.data) {
        // Validar horário da refeição
        const timeValidation = await validateVoucherTime(disposableResult.data.tipo_refeicao_id);
        
        if (!timeValidation.is_valid) {
          toast.error(timeValidation.message || 'Fora do horário permitido');
          return;
        }

        localStorage.setItem('disposableVoucher', JSON.stringify({
          code: voucherCode,
          mealTypeId: disposableResult.data.tipo_refeicao_id
        }));
        localStorage.setItem('currentMealType', JSON.stringify(disposableResult.data.tipos_refeicao));
        navigate('/user-confirmation');
        return;
      }

      // Se não for descartável, tenta validar como voucher comum
      const commonResult = await validateCommonVoucher(voucherCode);
      
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
          userId: user.id
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