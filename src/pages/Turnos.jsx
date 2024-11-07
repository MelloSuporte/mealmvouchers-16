import React from 'react';
import TurnosForm from '../components/admin/TurnosForm';

const Turnos = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gerenciamento de Turnos</h1>
      <TurnosForm />
    </div>
  );
};

export default Turnos;