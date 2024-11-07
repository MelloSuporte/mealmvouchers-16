import { useState } from 'react';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/utils/api";

export const useTurnosActions = () => {
  const queryClient = useQueryClient();
  const [submittingTurnoId, setSubmittingTurnoId] = useState(null);

  const createTurnoMutation = useMutation({
    mutationFn: async (newTurno) => {
      const response = await api.post('/shift-configurations', newTurno);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['shift-configurations']);
      toast.success("Turno criado com sucesso!");
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

    const turno = queryClient.getQueryData(['shift-configurations'])?.find(t => t.id === id);
    
    if (!turno) return;

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

  const handleCreateTurno = (newTurno) => {
    createTurnoMutation.mutate(newTurno);
  };

  return {
    handleTurnoChange,
    handleCreateTurno,
    submittingTurnoId
  };
};