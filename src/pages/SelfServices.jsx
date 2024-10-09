import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

const SelfServices = () => {
  const navigate = useNavigate();

  const handleMealSelection = (mealType) => {
    console.log(`Refeição selecionada: ${mealType}`);
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Blue curved shape */}
      <div className="absolute top-0 right-0 w-full h-1/3 bg-blue-600 rounded-bl-[30%]"></div>
      
      <div className="z-10 w-full max-w-md space-y-8">
        <h2 className="text-3xl font-bold text-center text-white mb-12">Escolha sua refeição</h2>
        <div className="space-y-4 bg-white p-8 rounded-lg shadow-lg">
          <Button
            onClick={() => handleMealSelection('Café')}
            className="w-full bg-transparent hover:bg-blue-100 text-blue-600 font-semibold py-3 px-4 border border-blue-500 hover:border-transparent rounded"
          >
            Café
          </Button>
          <Button
            onClick={() => handleMealSelection('Almoço')}
            className="w-full bg-transparent hover:bg-blue-100 text-blue-600 font-semibold py-3 px-4 border border-blue-500 hover:border-transparent rounded"
          >
            Almoço
          </Button>
          <Button
            onClick={() => handleMealSelection('Ceia')}
            className="w-full bg-transparent hover:bg-blue-100 text-blue-600 font-semibold py-3 px-4 border border-blue-500 hover:border-transparent rounded"
          >
            Ceia
          </Button>
          <Button
            onClick={() => handleMealSelection('Extra')}
            className="w-full bg-transparent hover:bg-blue-100 text-blue-600 font-semibold py-3 px-4 border border-blue-500 hover:border-transparent rounded"
          >
            Extra
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SelfServices;