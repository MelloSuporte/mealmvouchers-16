import { useState } from 'react';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/utils/api";

export const useTurnosActions = () => {
  const queryClient = useQueryClient();
  const [submittingTurnoId, setSubmittingTurnoId] = useState(null);

  const createTurnoMutation = useMutation({
    mutationFn: async (newTurno) => {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('Token não encontrado');
      }

      const turnoData = {
        tipo: String(newTurno.tipo),
        hora_inicio: String(newTurno.hora_inicio),
        hora_fim: String(newTurno.hora_fim),
        ativo: Boolean(newTurno.ativo)
      };
      
      const response = await api.post('/api/turnos', turnoData, {
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

      const turnoData = {
        hora_inicio: String(updatedTurno.hora_inicio),
        hora_fim: String(updatedTurno.hora_fim),
        ativo: Boolean(updatedTurno.ativo)
      };
      
      const response = await api.put(`/api/turnos/${updatedTurno.id}`, turnoData, {
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

  const handleCreateTurno = (newTurno) => {
    createTurnoMutation.mutate(newTurno);
  };

  return {
    handleTurnoChange,
    handleCreateTurno,
    submittingTurnoId
  };
};