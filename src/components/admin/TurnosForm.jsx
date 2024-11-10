import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import api from "@/utils/api";
import { Loader2, Plus } from "lucide-react";
import TurnoCard from "@/components/admin/turnos/TurnoCard";
import { useTurnosActions } from "@/components/admin/turnos/useTurnosActions";
import NovoTurnoDialog from "@/components/admin/turnos/NovoTurnoDialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const TurnosForm = () => {
  const navigate = useNavigate();
  const [dialogoAberto, setDialogoAberto] = React.useState(false);
  const [novoTurno, setNovoTurno] = React.useState({
    tipo: '',
    hora_inicio: '',
    hora_fim: '',
    ativo: true
  });

  const { data: dadosTurnos, isLoading: carregando, error: erro, refetch: recarregar } = useQuery({
    queryKey: ['turnos'],
    queryFn: async () => {
      try {
        const token = localStorage.getItem('adminToken');
        
        if (!token) {
          toast.error('Sessão expirada. Por favor, faça login novamente.');
          navigate('/login');
          return [];
        }

        const resposta = await api.get('/api/turnos', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        return resposta.data || [];
      } catch (erro) {
        if (erro.response?.status === 401) {
          toast.error('Sessão expirada. Por favor, faça login novamente.');
          navigate('/login');
          return [];
        }
        throw erro;
      }
    },
    retry: 1,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10
  });

  const { handleTurnoChange, submittingTurnoId, handleCreateTurno } = useTurnosActions();

  React.useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      toast.error('Você precisa estar logado para acessar esta página');
      navigate('/login');
    }
  }, [navigate]);

  const handleNovoTurno = async () => {
    await handleCreateTurno(novoTurno);
    setDialogoAberto(false);
    setNovoTurno({
      tipo: '',
      hora_inicio: '',
      hora_fim: '',
      ativo: true
    });
  };

  const getTurnoLabel = (tipoTurno) => {
    const labels = {
      'central': 'Turno Central (Administrativo)',
      'primeiro': 'Primeiro Turno',
      'segundo': 'Segundo Turno',
      'terceiro': 'Terceiro Turno'
    };
    return labels[tipoTurno] || tipoTurno;
  };

  if (carregando) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (erro) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-600">Erro ao carregar turnos. Por favor, tente novamente.</p>
        <Button 
          onClick={() => recarregar()} 
          variant="outline" 
          className="mt-2"
        >
          Tentar novamente
        </Button>
      </div>
    );
  }

  const turnos = Array.isArray(dadosTurnos) ? dadosTurnos : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <Button onClick={() => setDialogoAberto(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Turno
        </Button>
        <NovoTurnoDialog
          isOpen={dialogoAberto}
          onOpenChange={setDialogoAberto}
          novoTurno={novoTurno}
          setNovoTurno={setNovoTurno}
          onCreateTurno={handleNovoTurno}
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Horário Início</TableHead>
              <TableHead>Horário Fim</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {turnos.map((turno) => (
              <TableRow key={turno.id}>
                <TableCell>{getTurnoLabel(turno.tipo)}</TableCell>
                <TableCell>{turno.hora_inicio}</TableCell>
                <TableCell>{turno.hora_fim}</TableCell>
                <TableCell>{turno.ativo ? 'Ativo' : 'Inativo'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
