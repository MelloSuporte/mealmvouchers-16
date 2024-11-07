import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TurnosForm from '@/components/admin/TurnosForm';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    },
  },
});

const Turnos = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Gerenciamento de Turnos</h1>
        <TurnosForm />
      </div>
    </QueryClientProvider>
  );
};

export default Turnos;