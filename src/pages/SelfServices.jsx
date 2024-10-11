import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { Coffee, Utensils, Moon, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const SelfServices = () => {
  const navigate = useNavigate();
  const [showBomApetite, setShowBomApetite] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState('');

  const handleMealSelection = (mealType) => {
    setSelectedMeal(mealType);
    setShowBomApetite(true);
  };

  const handleCloseBomApetite = () => {
    setShowBomApetite(false);
    navigate('/voucher');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-start p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-full h-1/3 bg-blue-600 rounded-bl-[30%] flex items-start justify-center pt-8">
        <h2 className="text-3xl font-bold text-white">Escolha sua refeição</h2>
      </div>
      
      <div className="z-10 w-full max-w-md space-y-8 mt-32 flex flex-col items-center">
        <div className="grid grid-cols-2 gap-8 bg-white p-8 rounded-lg shadow-lg">
          <Button
            onClick={() => handleMealSelection('Almoço')}
            className="w-full h-32 bg-transparent hover:bg-blue-100 text-blue-600 font-semibold py-6 px-4 border border-blue-500 hover:border-transparent rounded-lg transition-all duration-300 flex flex-col items-center justify-center"
          >
            <Utensils className="h-12 w-12 mb-2" />
            Almoço
          </Button>
          <Button
            onClick={() => handleMealSelection('Café')}
            className="w-full h-32 bg-transparent hover:bg-blue-100 text-blue-600 font-semibold py-6 px-4 border border-blue-500 hover:border-transparent rounded-lg transition-all duration-300 flex flex-col items-center justify-center"
          >
            <Coffee className="h-12 w-12 mb-2" />
            Café
          </Button>
          <Button
            onClick={() => handleMealSelection('Ceia')}
            className="w-full h-32 bg-transparent hover:bg-blue-100 text-blue-600 font-semibold py-6 px-4 border border-blue-500 hover:border-transparent rounded-lg transition-all duration-300 flex flex-col items-center justify-center"
          >
            <Moon className="h-12 w-12 mb-2" />
            Ceia
          </Button>
          <Button
            onClick={() => handleMealSelection('Extra')}
            className="w-full h-32 bg-transparent hover:bg-blue-100 text-blue-600 font-semibold py-6 px-4 border border-blue-500 hover:border-transparent rounded-lg transition-all duration-300 flex flex-col items-center justify-center"
          >
            <Plus className="h-12 w-12 mb-2" />
            Extra
          </Button>
        </div>
      </div>

      <Dialog open={showBomApetite} onOpenChange={setShowBomApetite}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>BOM APETITE!</DialogTitle>
          </DialogHeader>
          <div className="text-center">
            <p className="text-2xl font-bold mb-4">Você escolheu: {selectedMeal}</p>
            <Button onClick={handleCloseBomApetite}>Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SelfServices;