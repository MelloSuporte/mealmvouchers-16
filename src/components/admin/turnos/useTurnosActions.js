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
        shift_type: String(newTurno.shift_type),
        start_time: String(newTurno.start_time),
        end_time: String(newTurno.end_time),
        is_active: Boolean(newTurno.is_active)
      };
      
      const response = await api.post('/api/configuracoes-turnos', turnoData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['shift-configurations']);
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
        start_time: String(updatedTurno.start_time),
        end_time: String(updatedTurno.end_time),
        is_active: Boolean(updatedTurno.is_active)
      };
      
      const response = await api.put(`/api/configuracoes-turnos/${updatedTurno.id}`, turnoData, {
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
      queryClient.invalidateQueries(['shift-configurations']);
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

    const turno = queryClient.getQueryData(['shift-configurations'])?.find(t => t.id === id);
    
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