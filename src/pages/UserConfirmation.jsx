import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from "sonner";
import logger from '../config/logger';
import { validateVoucher } from '../components/voucher/VoucherValidation';
import ConfirmationHeader from '../components/confirmation/ConfirmationHeader';
import UserDataDisplay from '../components/confirmation/UserDataDisplay';
import ConfirmationActions from '../components/confirmation/ConfirmationActions';

const UserConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const { mealType, mealName, voucherCode } = location.state;
      
      logger.info('Iniciando confirmação com dados:', {
        mealType,
        mealName,
        voucherCode
      });

      const validationResult = await validateVoucher(voucherCode, mealType);

      if (!validationResult.success) {
        throw new Error(validationResult.error || 'Erro ao validar voucher');
      }

      localStorage.removeItem('commonVoucher');
      
      navigate('/bom-apetite', { 
        state: { 
          userName: location.state.userName,
          turno: location.state.userTurno
        } 
      });

    } catch (error) {
      logger.error('Erro na validação:', error);
      toast.error(error.message || 'Erro ao validar voucher');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    localStorage.removeItem('commonVoucher');
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-red-700">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full space-y-6">
        <ConfirmationHeader />
        
        <UserDataDisplay 
          userName={location.state?.userName}
          mealName={location.state?.mealName}
        />

        <div className="flex items-center gap-2 text-gray-600">
          <span className="text-blue-600">ℹ</span>
          <p className="text-sm">
            Ao confirmar, seu voucher será validado e você será redirecionado para a próxima etapa.
          </p>
        </div>

        <ConfirmationActions 
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default UserConfirmation;