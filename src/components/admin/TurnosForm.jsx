import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/utils/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

const TurnosForm = () => {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Buscar configurações dos turnos
  const { data: turnos = [], isLoading, error } = useQuery({
    queryKey: ['shift-configurations'],
    queryFn: async () => {
      try {
        const response = await api.get('/api/shift-configurations');
        return response.data;
      } catch (error) {
        toast.error("Erro ao carregar configurações dos turnos");
        throw error;
      }
    }
  });

  // Mutation para atualizar turnos
  const updateTurnosMutation = useMutation({
    mutationFn: async (updatedTurno) => {
      const response = await api.put(`/api/shift-configurations/${updatedTurno.id}`, updatedTurno);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['shift-configurations']);
      toast.success("Horário do turno atualizado com sucesso!");
      setIsSubmitting(false);
    },
    onError: (error) => {
      toast.error("Erro ao atualizar turno: " + error.message);
      setIsSubmitting(false);
    }
  });

  const handleTurnoChange = (id, field, value) => {
    if (isSubmitting) {
      toast.warning("Aguarde, processando alteração anterior...");
      return;
    }

    setIsSubmitting(true);
    const turno = turnos.find(t => t.id === id);
    
    // Validação básica de horários
    if (field === 'start_time' && turno.end_time && value >= turno.end_time) {
      toast.error("Horário de entrada deve ser menor que o de saída");
      setIsSubmitting(false);
      return;
    }
    if (field === 'end_time' && turno.start_time && value <= turno.start_time) {
      toast.error("Horário de saída deve ser maior que o de entrada");
      setIsSubmitting(false);
      return;
    }

    const updatedTurno = {
      ...turno,
      [field]: value
    };

    updateTurnosMutation.mutate(updatedTurno);
  };

  const getTurnoLabel = (shiftType) => {
    const labels = {
      'central': 'Turno Central (Administrativo)',
      'primeiro': 'Primeiro Turno',
      'segundo': 'Segundo Turno',
      'terceiro': 'Terceiro Turno'
    };
    return labels[shiftType] || shiftType;
  };

  if (error) {
    return <div className="flex items-center justify-center p-8 text-red-500">Erro ao carregar configurações dos turnos</div>;
  }

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Carregando configurações dos turnos...</div>;
  }

  if (!turnos.length) {
    return <div className="flex items-center justify-center p-8">Nenhuma configuração de turno encontrada.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        {turnos.map((turno) => (
          <Card key={turno.id}>
            <CardHeader>
              <CardTitle>{getTurnoLabel(turno.shift_type)}</CardTitle>
              <CardDescription>Configure os horários de entrada e saída</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`entrada-${turno.id}`}>Horário de Entrada</Label>
                  <Input
                    id={`entrada-${turno.id}`}
                    type="time"
                    value={turno.start_time}
                    onChange={(e) => handleTurnoChange(turno.id, 'start_time', e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`saida-${turno.id}`}>Horário de Saída</Label>
                  <Input
                    id={`saida-${turno.id}`}
                    type="time"
                    value={turno.end_time}
                    onChange={(e) => handleTurnoChange(turno.id, 'end_time', e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`active-${turno.id}`}>Status do Turno</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`active-${turno.id}`}
                      checked={turno.is_active}
                      onCheckedChange={(checked) => handleTurnoChange(turno.id, 'is_active', checked)}
                    />
                    <Label htmlFor={`active-${turno.id}`}>
                      {turno.is_active ? 'Ativo' : 'Inativo'}
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TurnosForm;