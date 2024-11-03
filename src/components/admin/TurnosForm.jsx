import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/utils/api";

const TurnosForm = () => {
  const queryClient = useQueryClient();

  // Buscar configurações dos turnos
  const { data: turnos = [], isLoading } = useQuery({
    queryKey: ['shift-configurations'],
    queryFn: async () => {
      const response = await api.get('/api/shift-configurations');
      return response.data;
    }
  });

  // Mutation para atualizar turnos
  const updateTurnosMutation = useMutation({
    mutationFn: async (updatedTurnos) => {
      const response = await api.put('/api/shift-configurations', updatedTurnos);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['shift-configurations']);
      toast.success("Turnos atualizados com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar turnos: " + error.message);
    }
  });

  const handleTurnoChange = (id, field, value) => {
    const updatedTurnos = turnos.map(turno => 
      turno.id === id ? { ...turno, [field]: value } : turno
    );
    updateTurnosMutation.mutate(updatedTurnos);
  };

  if (isLoading) {
    return <div>Carregando configurações dos turnos...</div>;
  }

  return (
    <form className="space-y-4">
      {turnos.map((turno) => (
        <div key={turno.id} className="space-y-2">
          <Label>{turno.shift_type === 'central' ? 'Turno Central' :
                 turno.shift_type === 'primeiro' ? 'Primeiro Turno' :
                 turno.shift_type === 'segundo' ? 'Segundo Turno' : 'Terceiro Turno'}</Label>
          <div className="flex space-x-2">
            <Input
              type="time"
              value={turno.start_time}
              onChange={(e) => handleTurnoChange(turno.id, 'start_time', e.target.value)}
              placeholder="Entrada"
            />
            <Input
              type="time"
              value={turno.end_time}
              onChange={(e) => handleTurnoChange(turno.id, 'end_time', e.target.value)}
              placeholder="Saída"
            />
          </div>
        </div>
      ))}
    </form>
  );
};

export default TurnosForm;