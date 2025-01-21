import React from 'react';
import { Button } from "@/components/ui/button";
import MealTypeFields from './MealTypeFields';

const MealTypeFormContent = ({
  mealType,
  setMealType,
  mealValue,
  setMealValue,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  maxUsersPerDay,
  setMaxUsersPerDay,
  toleranceMinutes,
  setToleranceMinutes,
  mealTypes,
  existingMealData,
  onStatusChange,
  handleSaveMealType,
  isSubmitting
}) => {
  const formData = {
    nome: mealType,
    horario_inicio: startTime,
    horario_fim: endTime,
    valor: mealValue,
    max_usuarios_por_dia: maxUsersPerDay,
    minutos_tolerancia: toleranceMinutes,
    ativo: existingMealData?.ativo ?? true
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    switch (name) {
      case 'nome':
        setMealType(value);
        break;
      case 'valor':
        setMealValue(value);
        break;
      case 'horario_inicio':
        setStartTime(value);
        break;
      case 'horario_fim':
        setEndTime(value);
        break;
      case 'max_usuarios_por_dia':
        setMaxUsersPerDay(value);
        break;
      case 'minutos_tolerancia':
        setToleranceMinutes(value);
        break;
      case 'ativo':
        onStatusChange(value);
        break;
      default:
        break;
    }
  };

  return (
    <form className="space-y-4 max-w-md mx-auto bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Configuração de Refeição</h2>
      
      <MealTypeFields 
        formData={formData}
        onChange={handleFieldChange}
      />

      <Button 
        type="button" 
        onClick={handleSaveMealType}
        disabled={isSubmitting}
        className="w-full h-9 mt-6"
        variant="default"
        size="sm"
      >
        {isSubmitting ? 'Salvando...' : existingMealData ? 'Atualizar Refeição' : 'Cadastrar Refeição'}
      </Button>
    </form>
  );
};

export default MealTypeFormContent;