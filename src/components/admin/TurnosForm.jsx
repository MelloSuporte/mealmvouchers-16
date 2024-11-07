import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/utils/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Plus } from "lucide-react";
import TurnoCard from './turnos/TurnoCard';
import NewTurnoDialog from './turnos/NewTurnoDialog';

const TurnosForm = () => {
  const queryClient = useQueryClient();
  const [submittingTurnoId, setSubmittingTurnoId] = useState(null);
  const [isNewTurnoDialogOpen, setIsNewTurnoDialogOpen] = useState(false);
  const [newTurno, setNewTurno] = useState({
    shift_type: '',
    start_time: '',
    end_time: '',
    is_active: true
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['shift-configurations'],
    queryFn: async () => {
      const response = await api.get('/shift-configurations');
      return response.data || [];
    }
  });

  const turnos = Array.isArray(data) ? data : [];

  const createTurnoMutation = useMutation({
    mutationFn: async (newTurno) => {
      const response = await api.post('/shift-configurations', newTurno);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['shift-configurations']);
      toast.success("Turno criado com sucesso!");
      setIsNewTurnoDialogOpen(false);
      setNewTurno({
        shift_type: '',
        start_time: '',
        end_time: '',
        is_active: true
      });
    },
    onError: (error) => {
      toast.error("Erro ao criar turno: " + error.message);
    }
  });

  const updateTurnosMutation = useMutation({
    mutationFn: async (updatedTurno) => {
      const response = await api.put(`/shift-configurations/${updatedTurno.id}`, {
        start_time: updatedTurno.start_time,
        end_time: updatedTurno.end_time,
        is_active: updatedTurno.is_active
      });
      return response.data;
    },
    onMutate: (variables) => {
      setSubmittingTurnoId(variables.id);
    },
    onSettled: () => {
      setSubmittingTurnoId(null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['shift-configurations']);
      toast.success("Horário do turno atualizado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar turno: " + error.message);
    }
  });

  const handleTurnoChange = (id, field, value) => {
    if (submittingTurnoId === id) {
      toast.warning("Aguarde, processando alteração anterior...");
      return;
    }

    const turno = turnos.find(t => t.id === id);
    
    if (field === 'start_time' && turno.end_time && value >= turno.end_time) {
      toast.error("Horário de entrada deve ser menor que o de saída");
      return;
    }
    if (field === 'end_time' && turno.start_time && value <= turno.start_time) {
      toast.error("Horário de saída deve ser maior que o de entrada");
      return;
    }

    const updatedTurno = {
      ...turno,
      [field]: value
    };

    updateTurnosMutation.mutate(updatedTurno);
  };

  const handleCreateTurno = () => {
    if (!newTurno.shift_type || !newTurno.start_time || !newTurno.end_time) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (newTurno.start_time >= newTurno.end_time) {
      toast.error("Horário de entrada deve ser menor que o de saída");
      return;
    }

    createTurnoMutation.mutate(newTurno);
  };

  if (error) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertDescription>
            Erro ao carregar configurações dos turnos.
            <Button 
              variant="link" 
              onClick={() => refetch()} 
              className="pl-2"
            >
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Carregando configurações dos turnos...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          onClick={() => setIsNewTurnoDialogOpen(true)}
          className="mb-4"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Turno
        </Button>
        <NewTurnoDialog
          isOpen={isNewTurnoDialogOpen}
          onOpenChange={setIsNewTurnoDialogOpen}
          newTurno={newTurno}
          setNewTurno={setNewTurno}
          onCreateTurno={handleCreateTurno}
        />
      </div>
      <div className="grid gap-4">
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

export default TurnosForm;