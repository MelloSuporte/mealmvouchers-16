import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import api from "@/utils/api";
import { Loader2 } from "lucide-react";
import TurnoCard from "@/components/admin/turnos/TurnoCard";
import { useTurnosActions } from "@/components/admin/turnos/useTurnosActions";
import NewTurnoDialog from "@/components/admin/turnos/NewTurnoDialog";
import { Button } from "@/components/ui/button";

const TurnosForm = () => {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [newTurno, setNewTurno] = React.useState({
    shift_type: '',
    start_time: '',
    end_time: '',
    is_active: true
  });

  const { data: turnosData, isLoading, error, refetch } = useQuery({
    queryKey: ['configuracoes-turnos'],
    queryFn: async () => {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        toast.error('Sessão expirada. Por favor, faça login novamente.');
        navigate('/login');
        return [];
      }

      try {
        const response = await api.get('/api/configuracoes-turnos', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        return response.data || [];
      } catch (error) {
        console.error('Error fetching shift configurations:', error);
        if (error.response?.status === 401) {
          toast.error('Sessão expirada. Por favor, faça login novamente.');
          navigate('/login');
          return [];
        }
        throw error;
      }
    },
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10 // 10 minutes
  });

  const { handleTurnoChange, submittingTurnoId, handleCreateTurno } = useTurnosActions();

  React.useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      toast.error('Você precisa estar logado para acessar esta página');
      navigate('/login');
    }
  }, [navigate]);

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
        <Button 
          onClick={() => refetch()} 
          variant="outline" 
          className="mt-2"
        >
          Tentar novamente
        </Button>
      </div>
    );
  }

  const turnos = Array.isArray(turnosData) ? turnosData : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <NewTurnoDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          newTurno={newTurno}
          setNewTurno={setNewTurno}
          onCreateTurno={handleCreateTurno}
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