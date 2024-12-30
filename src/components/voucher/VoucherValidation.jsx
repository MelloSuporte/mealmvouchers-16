import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import VoucherForm from './VoucherForm';
import { 
  identifyVoucherType,
  validateCommonVoucher, 
  validateDisposableVoucher,
  validateMealTimeAndInterval
} from '../../services/voucherValidationService';

const VoucherValidationForm = () => {
  const navigate = useNavigate();
  const [voucherCode, setVoucherCode] = React.useState('');
  const [isValidating, setIsValidating] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isValidating) return;
    
    try {
      setIsValidating(true);
      console.log('Iniciando validação do voucher:', voucherCode);
      
      // Identificar tipo de voucher
      const voucherType = await identifyVoucherType(voucherCode);
      console.log('Tipo de voucher identificado:', voucherType);

      if (!voucherType) {
        toast.error('Voucher inválido');
        return;
      }

      // Validar baseado no tipo
      if (voucherType === 'descartavel') {
        const result = await validateDisposableVoucher(voucherCode);
        console.log('Resultado validação voucher descartável:', result);
        
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
        const result = await validateCommonVoucher(voucherCode);
        console.log('Resultado validação voucher comum:', result);
        
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
      console.error('Erro ao validar voucher:', error);
      // Check if the error is related to shift time
      if (error.message?.includes('Fora do horário do turno') || 
          error.message === 'Fora do Horário de Turno' ||
          (typeof error.body === 'string' && error.body.includes('Fora do horário do turno'))) {
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

export default VoucherValidationForm;