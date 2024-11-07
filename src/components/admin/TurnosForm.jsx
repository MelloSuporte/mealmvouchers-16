import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/utils/api";
import { Loader2 } from "lucide-react";
import TurnoCard from "@/components/admin/turnos/TurnoCard";
import { useTurnosActions } from "@/components/admin/turnos/useTurnosActions";
import NewTurnoDialog from "@/components/admin/turnos/NewTurnoDialog";
import { useAdmin } from '@/contexts/AdminContext';

const TurnosForm = () => {
  // Estado para controlar o diálogo de novo turno
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const { isMasterAdmin } = useAdmin(); // Verifica se é admin master

  // Estado inicial para novo turno
  const [newTurno, setNewTurno] = React.useState({
    shift_type: '',
    start_time: '',
    end_time: '',
    is_active: true
  });

  // Busca os dados dos turnos do servidor
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

  // Hook personalizado para gerenciar ações dos turnos
  const { handleTurnoChange, submittingTurnoId, handleCreateTurno } = useTurnosActions();

  // Exibe loader durante o carregamento
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Exibe mensagem de erro se houver falha no carregamento
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-600">Erro ao carregar turnos. Por favor, tente novamente.</p>
      </div>
    );
  }

  // Função para criar novo turno
  const onCreateTurno = async () => {
    // Verifica se usuário tem permissão
    if (!isMasterAdmin) {
      toast.error("Apenas administradores master podem criar novos turnos");
      return;
    }

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
            onTurnoChange={(id, field, value) => {
              // Verifica permissão antes de permitir alterações
              if (!isMasterAdmin) {
                toast.error("Apenas administradores master podem modificar turnos");
                return;
              }
              handleTurnoChange(id, field, value);
            }}
            isSubmitting={submittingTurnoId === turno.id}
          />
        ))}
      </div>
    </div>
  );
};

export default TurnosForm;