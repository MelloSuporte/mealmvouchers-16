import React from 'react';
import { useMealTypeForm } from './useMealTypeForm';
import MealTypeFormContent from './MealTypeFormContent';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MealTypeForm = () => {
  const {
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
    isSubmitting,
    handleSaveMealType,
    handleStatusChange,
    handleMealTypeSelect
  } = useMealTypeForm();

  return (
    <div className="space-y-6">
      <div className="w-full max-w-md mx-auto">
        <Select onValueChange={handleMealTypeSelect} value={mealType || undefined}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione ou crie um tipo de refeição" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="new">Novo tipo de refeição</SelectItem>
            {mealTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <MealTypeFormContent
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
        existingMealData={existingMealData}
        onStatusChange={handleStatusChange}
        handleSaveMealType={handleSaveMealType}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default MealTypeForm;