import React from 'react';
import { AdminProvider } from '../contexts/AdminContext';
import TurnosForm from '@/components/admin/TurnosForm';

const Turnos = () => {
  return (
    <AdminProvider>
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Gerenciamento de Turnos</h1>
        </div>
        <TurnosForm />
      </div>
    </AdminProvider>
  );
};

export default Turnos;