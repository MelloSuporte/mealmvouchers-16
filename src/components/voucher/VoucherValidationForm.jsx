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
import logger from '../../config/logger';

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

      // Get current meal type based on time
      const currentTime = new Date().toLocaleTimeString('pt-BR', { hour12: false });
      const { data: mealTypes, error: mealTypesError } = await supabase
        .from('tipos_refeicao')
        .select('*')
        .eq('ativo', true)
        .gte('horario_fim', currentTime)
        .lte('horario_inicio', currentTime);

      if (mealTypesError) {
        console.error('Erro ao buscar tipo de refeição:', mealTypesError);
        toast.error('Erro ao validar horário da refeição');
        return;
      }

      if (!mealTypes || mealTypes.length === 0) {
        toast.error('Nenhum tipo de refeição disponível neste horário');
        return;
      }

      const currentMealType = mealTypes[0];

      // Validar baseado no tipo
      if (voucherType === 'descartavel') {
        const result = await validateDisposableVoucher(voucherCode, currentMealType.id);
        console.log('Resultado validação voucher descartável:', result);
        
        if (result.success) {
          localStorage.setItem('disposableVoucher', JSON.stringify({
            code: voucherCode,
            mealTypeId: currentMealType.id,
            mealType: currentMealType.nome
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
        toast.error(result.error);
      } else {
        toast.error('Tipo de voucher não suportado no momento');
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