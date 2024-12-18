import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import VoucherForm from './VoucherForm';
import { validateDisposableVoucher, validateCommonVoucher } from '../../services/voucherValidationService';

const VoucherValidationForm = () => {
  const navigate = useNavigate();
  const [voucherCode, setVoucherCode] = React.useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      console.log('Verificando voucher:', voucherCode);
      
      // Primeiro tenta validar como voucher descartável
      const disposableResult = await validateDisposableVoucher(voucherCode);
      
      if (disposableResult.success) {
        const { voucher } = disposableResult;
        localStorage.setItem('disposableVoucher', JSON.stringify({
          code: voucherCode,
          mealTypeId: voucher.tipo_refeicao_id,
          mealType: voucher.tipos_refeicao.nome
        }));
        navigate('/self-services');
        return;
      }

      // Se não for descartável, tenta como voucher comum
      const commonResult = await validateCommonVoucher(voucherCode);
      
      if (commonResult.success) {
        const { user } = commonResult;
        localStorage.setItem('commonVoucher', JSON.stringify({
          code: voucherCode,
          userName: user.nome,
          turno: user.turnos?.tipo_turno,
          cpf: user.cpf
        }));
        navigate('/self-services');
        return;
      }

      // Se chegou aqui, nenhum voucher válido foi encontrado
      toast.error(disposableResult.error || commonResult.error || "Voucher inválido ou já utilizado");
      
    } catch (error) {
      console.error('Erro ao validar voucher:', error);
      toast.error(error.message || "Erro ao validar o voucher");
    }
  };

  return (
    <VoucherForm
      voucherCode={voucherCode}
      onSubmit={handleSubmit}
      onNumpadClick={(num) => setVoucherCode(prev => prev.length < 4 ? prev + num : prev)}
      onBackspace={() => setVoucherCode(prev => prev.slice(0, -1))}
    />
  );
};

export default VoucherValidationForm;