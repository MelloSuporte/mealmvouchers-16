import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Utensils, Coffee, Moon, Home, Plus } from 'lucide-react';
import { Button } from '../components/ui/button';

const SelfServices = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleConfirm = (mealType) => {
    navigate('/bom-apetite', {
      state: {
        ...location.state,
        mealType
      }
    });
  };

  const meals = [
    { id: 'almoco', name: 'Almoço', icon: Utensils },
    { id: 'cafe-1', name: 'Café 04:00 às 05:00', icon: Coffee },
    { id: 'cafe-2', name: 'Café 06:00 às 06:30', icon: Coffee },
    { id: 'cafe-3', name: 'Café 08:00 às 08:30', icon: Coffee },
    { id: 'ceia', name: 'Ceia', icon: Moon },
    { id: 'jantar', name: 'Jantar', icon: Moon },
    { id: 'lanche', name: 'Lanche', icon: Home },
    { id: 'extra', name: 'Refeição Extra', icon: Plus },
  ];

  return (
    <div 
      className="min-h-screen p-4 bg-[#ea384c]"
      style={{
        backgroundImage: `url('/lovable-uploads/89645f31-8b98-461b-b03b-facf1756032b.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/90 rounded-lg p-6 shadow-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {meals.map((meal) => {
              const Icon = meal.icon;
              return (
                <Button
                  key={meal.id}
                  onClick={() => handleConfirm(meal.id)}
                  variant="outline"
                  className="h-auto py-6 flex flex-col items-center gap-2 bg-white hover:bg-gray-50"
                >
                  <Icon className="h-8 w-8" />
                  <span className="text-sm text-center">{meal.name}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelfServices;