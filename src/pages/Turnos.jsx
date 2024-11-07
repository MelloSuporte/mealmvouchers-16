import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/utils/api";
import { Loader2 } from "lucide-react";
import TurnoCard from "@/components/admin/turnos/TurnoCard";
import { useTurnosActions } from "@/components/admin/turnos/useTurnosActions";

const Turnos = () => {
  const { data: turnos = [], isLoading, error } = useQuery({
    queryKey: ['shift-configurations'],
    queryFn: async () => {
      try {
        const response = await api.get('/shift-configurations');
        return response.data;
      } catch (error) {
        toast.error('Erro ao carregar configurações dos turnos');
        throw error;
      }
    }
  });

  const { handleTurnoChange, submittingTurnoId } = useTurnosActions();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <p className="text-red-500">Erro ao carregar turnos</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Configuração de Turnos</h1>
      <div className="grid gap-6">
        {turnos.map((turno) => (
          <TurnoCard
            key={turno.id}
            turno={turno}
            onTurnoChange={handleTurnoChange}
            isSubmitting={submittingTurnoId === turno.id}
          />
        ))}
      </div>
    </div>
  );
};

export default Turnos;