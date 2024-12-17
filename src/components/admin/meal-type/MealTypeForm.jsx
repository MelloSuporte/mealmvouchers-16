import React from 'react';
import { useMealTypeForm } from './useMealTypeForm';
import MealTypeFormContent from './MealTypeFormContent';

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
    handleStatusChange
  } = useMealTypeForm();

  return (
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
      mealTypes={mealTypes}
      existingMealData={existingMealData}
      onStatusChange={handleStatusChange}
      handleSaveMealType={handleSaveMealType}
      isSubmitting={isSubmitting}
    />
  );
};

export default MealTypeForm;