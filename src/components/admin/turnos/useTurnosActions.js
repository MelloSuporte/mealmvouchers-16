import { useState } from 'react';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/utils/api";

export const useTurnosActions = () => {
  const queryClient = useQueryClient();
  const [submittingTurnoId, setSubmittingTurnoId] = useState(null);

  const createTurnoMutation = useMutation({
    mutationFn: async (novoTurno) => {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('Token não encontrado');
      }

      const response = await api.post('/api/turnos', {
        tipo: novoTurno.tipo,
        hora_inicio: novoTurno.hora_inicio,
        hora_fim: novoTurno.hora_fim,
        ativo: novoTurno.ativo
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['turnos']);
      toast.success("Turno criado com sucesso!");
    },
    onError: (error) => {
      console.error('Erro detalhado:', error);
      toast.error("Erro ao criar turno: " + (error.response?.data?.message || error.message));
    }
  });

  const updateTurnosMutation = useMutation({
    mutationFn: async (updatedTurno) => {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('Token não encontrado');
      }

      const response = await api.put(`/api/turnos/${updatedTurno.id}`, {
        hora_inicio: updatedTurno.hora_inicio,
        hora_fim: updatedTurno.hora_fim,
        ativo: updatedTurno.ativo
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
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
      console.error('Erro detalhado:', error);
      toast.error("Erro ao atualizar turno: " + (error.response?.data?.message || error.message));
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