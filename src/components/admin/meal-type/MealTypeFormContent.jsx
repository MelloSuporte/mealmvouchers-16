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
  return (
    <form className="space-y-4 max-w-md mx-auto bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Configuração de Refeição</h2>
      
      <MealTypeFields 
        mealType={mealType}
        setMealType={setMealType}
        mealValue={mealValue}
        setMealValue={setMealValue}
        startTime={startTime}
        setStartTime={setStartTime}
        endTime={endTime}
        setEndTime={setEndTime}
        maxUsersPerDay={maxUsersPerDay}
        setMaxUsersPerDay={setMaxUsersPerDay}
        toleranceMinutes={toleranceMinutes}
        setToleranceMinutes={setToleranceMinutes}
        mealTypes={mealTypes}
        existingMealData={existingMealData}
        onStatusChange={onStatusChange}
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