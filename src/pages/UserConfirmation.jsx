import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import api from '../utils/api';

const UserConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    if (!location.state) {
      navigate('/');
    } else {
      setUserName(location.state.userName);
    }
  }, [location.state, navigate]);

  const handleConfirm = async () => {
    try {
      const commonVoucher = JSON.parse(localStorage.getItem('commonVoucher') || '{}');
      
      const response = await api.post('/vouchers/validate', {
        cpf: commonVoucher.cpf,
        voucherCode: commonVoucher.code,
        mealType: location.state.mealType
      });

      if (response.data.success) {
        // Armazena o voucher usado com timestamp
        const usedVouchers = JSON.parse(localStorage.getItem('usedCommonVouchers') || '[]');
        usedVouchers.push({
          ...commonVoucher,
          usedAt: new Date().toISOString(),
          mealType: location.state.mealType
        });
        localStorage.setItem('usedCommonVouchers', JSON.stringify(usedVouchers));
        
        // Move o voucher atual para o histórico
        localStorage.removeItem('commonVoucher');
        
        navigate('/bom-apetite/' + response.data.userName, {
          state: { userName: response.data.userName }
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao validar voucher');
      navigate('/');
    }
  };

  return (
    <div>
      <h1>Confirmar Uso do Voucher</h1>
      <p>Usuário: {userName}</p>
      <button onClick={handleConfirm}>Confirmar</button>
    </div>
  );
};

export default UserConfirmation;
