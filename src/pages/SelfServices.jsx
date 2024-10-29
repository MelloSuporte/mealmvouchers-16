import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from 'react-router-dom';
import { Coffee, Utensils, Moon, Plus, Sandwich } from 'lucide-react';
import { toast } from "sonner";

const SelfServices = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [backgroundImage, setBackgroundImage] = useState('');

  useEffect(() => {
    const savedBackground = localStorage.getItem('userConfirmationBackground');
    if (savedBackground) {
      setBackgroundImage(savedBackground);
    }
  }, []);

  const handleMealSelection = (mealType) => {
    const today = new Date().toISOString().split('T')[0];
    const usedVouchers = JSON.parse(localStorage.getItem('usedVouchers') || '{}');

    if (!usedVouchers[today]) {
      usedVouchers[today] = [];
    }

    if (usedVouchers[today].includes(mealType)) {
      toast.error(`Você já utilizou um voucher para ${mealType} hoje.`);
      return;
    }

    usedVouchers[today].push(mealType);
    localStorage.setItem('usedVouchers', JSON.stringify(usedVouchers));

    const userName = "User"; // Substitua isso pela lógica real de obtenção do nome do usuário
    navigate(`/bom-apetite/${userName}`, { state: { mealType } });
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-start p-4 relative bg-blue-600 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${backgroundImage})`,
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