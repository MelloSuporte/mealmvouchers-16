import React from 'react';
import MealRegistrationForm from '../components/admin/meals/MealRegistrationForm';

const Refeicao = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Gerenciamento de Refeições</h1>
      <MealRegistrationForm />
    </div>
  );
};

export default Refeicao;