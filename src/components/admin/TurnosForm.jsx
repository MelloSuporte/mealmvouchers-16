import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/utils/api";
import { Loader2 } from "lucide-react";
import TurnoCard from "@/components/admin/turnos/TurnoCard";
import { useTurnosActions } from "@/components/admin/turnos/useTurnosActions";
import NewTurnoDialog from "@/components/admin/turnos/NewTurnoDialog";
import { useAdmin } from '@/contexts/AdminContext';

/**
 * COMPONENTE DE GERENCIAMENTO DE TURNOS
 * Status: ESTÁVEL
 * 
 * Funcionalidades:
 * - Visualização de turnos
 * - Criação de novos turnos
 * - Edição de horários
 * - Ativação/desativação de turnos
 * 
 * Permissões:
 * - Administrador Master: Acesso total
 */

const TurnosForm = () => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const { isMasterAdmin } = useAdmin();

  const [newTurno, setNewTurno] = React.useState({
    shift_type: '',
    start_time: '',
    end_time: '',
    is_active: true
  });

  const { data: turnos = [], isLoading, error } = useQuery({
    queryKey: ['shift-configurations'],
    queryFn: async () => {
      try {
        const response = await api.get('/api/shift-configurations', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });
        return response.data;
      } catch (error) {
        toast.error('Erro ao carregar configurações dos turnos');
        throw error;
      }
    }
  });

  const { handleTurnoChange, submittingTurnoId, handleCreateTurno } = useTurnosActions();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-600">Erro ao carregar turnos. Por favor, tente novamente.</p>
      </div>
    );
  }

  const onCreateTurno = async () => {
    await handleCreateTurno(newTurno);
    setIsDialogOpen(false);
    setNewTurno({
      shift_type: '',
      start_time: '',
      end_time: '',
      is_active: true
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <NewTurnoDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          newTurno={newTurno}
          setNewTurno={setNewTurno}
          onCreateTurno={onCreateTurno}
        />
      </div>
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

export default TurnosForm;