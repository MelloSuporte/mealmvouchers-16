import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { Coffee, Utensils, Moon, Plus, Sandwich } from 'lucide-react';
import { toast } from "sonner";
import api from '../utils/api';

const SelfServices = () => {
  const navigate = useNavigate();
  const [backgroundImage, setBackgroundImage] = useState('');

  useEffect(() => {
    const savedBackground = localStorage.getItem('userConfirmationBackground');
    if (savedBackground) {
      setBackgroundImage(savedBackground);
    }

    // Verifica se existe um voucher no localStorage
    const disposableVoucher = localStorage.getItem('disposableVoucher');
    const commonVoucher = localStorage.getItem('commonVoucher');
    
    if (!disposableVoucher && !commonVoucher) {
      toast.error('Nenhum voucher válido encontrado');
      navigate('/voucher');
    }
  }, [navigate]);

  const handleMealSelection = async (mealType) => {
    try {
      const disposableVoucher = JSON.parse(localStorage.getItem('disposableVoucher') || '{}');
      const commonVoucher = JSON.parse(localStorage.getItem('commonVoucher') || '{}');
      
      // Se for voucher descartável
      if (disposableVoucher.code) {
        const response = await api.post('/vouchers/validate-disposable', {
          code: disposableVoucher.code,
          meal_type_id: disposableVoucher.mealTypeId
        });

        if (response.data.success) {
          // Armazena o voucher usado com timestamp
          const usedVouchers = JSON.parse(localStorage.getItem('usedDisposableVouchers') || '[]');
          usedVouchers.push({
            ...disposableVoucher,
            usedAt: new Date().toISOString(),
            mealType
          });
          localStorage.setItem('usedDisposableVouchers', JSON.stringify(usedVouchers));
          
          // Move o voucher atual para o histórico
          localStorage.removeItem('disposableVoucher');
          navigate(`/bom-apetite/Usuario`, { state: { mealType } });
        }
      } 
      // Se for voucher comum ou extra
      else if (commonVoucher.code) {
        navigate('/user-confirmation', { 
          state: { 
            userName: commonVoucher.userName,
            userTurno: commonVoucher.turno,
            mealType,
            voucherCode: commonVoucher.code
          }
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao validar voucher');
      navigate('/voucher');
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-start p-4 relative bg-blue-600 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined
      }}
    >
      <div className="absolute top-0 right-0 w-full h-1/3 bg-blue-600 rounded-bl-[30%] flex items-start justify-center pt-8">
        <h2 className="text-3xl font-bold text-white">Escolha sua refeição</h2>
      </div>
      
      <div className="z-10 w-full max-w-md space-y-8 mt-32 flex flex-col items-center">
        <div className="grid grid-cols-2 gap-8 bg-white/90 p-8 rounded-lg shadow-lg backdrop-blur-sm">
          <Button
            onClick={() => handleMealSelection('Almoço')}
            className="w-full h-32 bg-transparent hover:bg-gray-100 text-gray-800 font-semibold py-6 px-4 border border-gray-500 hover:border-transparent rounded-lg transition-all duration-300 flex flex-col items-center justify-center"
          >
            <Utensils className="h-12 w-12 mb-2" />
            Almoço
          </Button>
          <Button
            onClick={() => handleMealSelection('Café')}
            className="w-full h-32 bg-transparent hover:bg-gray-100 text-gray-800 font-semibold py-6 px-4 border border-gray-500 hover:border-transparent rounded-lg transition-all duration-300 flex flex-col items-center justify-center"
          >
            <Coffee className="h-12 w-12 mb-2" />
            Café
          </Button>
          <Button
            onClick={() => handleMealSelection('Lanche')}
            className="w-full h-32 bg-transparent hover:bg-gray-100 text-gray-800 font-semibold py-6 px-4 border border-gray-500 hover:border-transparent rounded-lg transition-all duration-300 flex flex-col items-center justify-center"
          >
            <Sandwich className="h-12 w-12 mb-2" />
            Lanche
          </Button>
          <Button
            onClick={() => handleMealSelection('Jantar')}
            className="w-full h-32 bg-transparent hover:bg-gray-100 text-gray-800 font-semibold py-6 px-4 border border-gray-500 hover:border-transparent rounded-lg transition-all duration-300 flex flex-col items-center justify-center"
          >
            <Moon className="h-12 w-12 mb-2" />
            Jantar
          </Button>
          <Button
            onClick={() => handleMealSelection('Ceia')}
            className="w-full h-32 bg-transparent hover:bg-gray-100 text-gray-800 font-semibold py-6 px-4 border border-gray-500 hover:border-transparent rounded-lg transition-all duration-300 flex flex-col items-center justify-center"
          >
            <Moon className="h-12 w-12 mb-2" />
            Ceia
          </Button>
          <Button
            onClick={() => handleMealSelection('Extra')}
            className="w-full h-32 bg-transparent hover:bg-gray-100 text-gray-800 font-semibold py-6 px-4 border border-gray-500 hover:border-transparent rounded-lg transition-all duration-300 flex flex-col items-center justify-center"
          >
            <Plus className="h-12 w-12 mb-2" />
            Extra
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SelfServices;