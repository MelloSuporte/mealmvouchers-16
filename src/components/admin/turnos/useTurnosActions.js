import { useState } from 'react';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/utils/api";

export const useTurnosActions = () => {
  const queryClient = useQueryClient();
  const [submittingTurnoId, setSubmittingTurnoId] = useState(null);

  const createTurnoMutation = useMutation({
    mutationFn: async (novoTurno) => {
      console.log('[Creating Turno]', novoTurno);
      const response = await api.post('/turnos', novoTurno);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['turnos']);
      toast.success("Turno criado com sucesso!");
    },
    onError: (error) => {
      console.error('[Create Turno Error]', error);
      toast.error(`Erro ao criar turno: ${error.response?.data?.erro || error.message}`);
    }
  });

  const updateTurnosMutation = useMutation({
    mutationFn: async (updatedTurno) => {
      console.log('[Updating Turno]', updatedTurno);
      const response = await api.put(`/turnos/${updatedTurno.id}`, {
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
      queryClient.invalidateQueries(['turnos']);
      toast.success("Horário do turno atualizado com sucesso!");
    },
    onError: (error) => {
      console.error('[Update Turno Error]', error);
      toast.error(`Erro ao atualizar turno: ${error.response?.data?.erro || error.message}`);
    }
  });

  const handleTurnoChange = (id, field, value) => {
    if (submittingTurnoId === id) {
      toast.warning("Aguarde, processando alteração anterior...");
      return;
    }

    const turno = queryClient.getQueryData(['turnos'])?.find(t => t.id === id);
    if (!turno) return;

    const updatedTurno = {
      ...turno,
      [field]: value
    };

    updateTurnosMutation.mutate(updatedTurno);
  };

  const handleCreateTurno = (novoTurno) => {
    createTurnoMutation.mutate(novoTurno);
  };

  return {
    handleTurnoChange,
    handleCreateTurno,
    submittingTurnoId
  };
};