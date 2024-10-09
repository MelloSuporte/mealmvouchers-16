import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

const SelfServices = () => {
  const navigate = useNavigate();

  const handleMealSelection = (mealType) => {
    // Aqui você pode adicionar a lógica para processar a seleção da refeição
    console.log(`Refeição selecionada: ${mealType}`);
    // Por enquanto, vamos apenas navegar de volta para a página inicial
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <h2 className="text-3xl font-bold text-center text-blue-600">Escolha sua refeição</h2>
        <div className="space-y-4">
          <Button
            onClick={() => handleMealSelection('Café')}
            className="w-full bg-blue-500 hover:bg-blue-600"
          >
            Café
          </Button>
          <Button
            onClick={() => handleMealSelection('Almoço')}
            className="w-full bg-green-500 hover:bg-green-600"
          >
            Almoço
          </Button>
          <Button
            onClick={() => handleMealSelection('Ceia')}
            className="w-full bg-purple-500 hover:bg-purple-600"
          >
            Ceia
          </Button>
          <Button
            onClick={() => handleMealSelection('Extra')}
            className="w-full bg-yellow-500 hover:bg-yellow-600"
          >
            Extra
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SelfServices;