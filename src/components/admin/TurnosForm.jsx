import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/config/supabase";
import { Loader2, Plus } from "lucide-react";
import { useTurnosActions } from "@/components/admin/turnos/useTurnosActions";
import NovoTurnoDialog from "@/components/admin/turnos/NovoTurnoDialog";
import EditarTurnoDialog from "@/components/admin/turnos/EditarTurnoDialog";
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
  const [dialogoEdicaoAberto, setDialogoEdicaoAberto] = React.useState(false);
  const [turnoSelecionado, setTurnoSelecionado] = React.useState(null);
  const [novoTurno, setNovoTurno] = React.useState({
    tipo_turno: '',
    horario_inicio: '',
    horario_fim: '',
    ativo: true
  });

  const { data: dadosTurnos, isLoading: carregando, error: erro, refetch: recarregar } = useQuery({
    queryKey: ['turnos'],
    queryFn: async () => {
      try {
        console.log('Buscando turnos...');
        const { data, error } = await supabase
          .from('turnos')
          .select('*')
          .eq('ativo', true)
          .order('id');

        if (error) {
          console.error('Erro ao buscar turnos:', error);
          toast.error(`Erro ao buscar turnos: ${error.message}`);
          throw error;
        }

        console.log('Turnos encontrados:', data);
        return data || [];
      } catch (erro) {
        console.error('Erro ao buscar turnos:', erro);
        throw erro;
      }
    }
  });

  const { handleTurnoChange, submittingTurnoId, handleCreateTurno } = useTurnosActions();

  const handleNovoTurno = async () => {
    await handleCreateTurno(novoTurno);
    setDialogoAberto(false);
    setNovoTurno({
      tipo_turno: '',
      horario_inicio: '',
      horario_fim: '',
      ativo: true
    });
    recarregar();
  };

  const handleEditarTurno = (turno) => {
    setTurnoSelecionado(turno);
    setDialogoEdicaoAberto(true);
  };

  const handleSalvarEdicao = async (turnoEditado) => {
    await handleTurnoChange(turnoEditado.id, 'horario_inicio', turnoEditado.horario_inicio);
    await handleTurnoChange(turnoEditado.id, 'horario_fim', turnoEditado.horario_fim);
    await handleTurnoChange(turnoEditado.id, 'ativo', turnoEditado.ativo);
    recarregar();
    toast.success('Turno atualizado com sucesso!');
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
        <p className="text-red-600">Erro ao buscar turnos: {erro.message}</p>
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
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <Button onClick={() => setDialogoAberto(true)} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Novo Turno
        </Button>
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Tipo</TableHead>
              <TableHead className="font-semibold w-32">Início</TableHead>
              <TableHead className="font-semibold w-32">Fim</TableHead>
              <TableHead className="font-semibold w-24 text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {turnos.map((turno) => (
              <TableRow 
                key={turno.id}
                className="cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => handleEditarTurno(turno)}
              >
                <TableCell className="font-medium">{getTurnoLabel(turno.tipo_turno)}</TableCell>
                <TableCell>{turno.horario_inicio}</TableCell>
                <TableCell>{turno.horario_fim}</TableCell>
                <TableCell className="text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    turno.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {turno.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <NovoTurnoDialog
        isOpen={dialogoAberto}
        onOpenChange={setDialogoAberto}
        novoTurno={novoTurno}
        setNovoTurno={setNovoTurno}
        onCreateTurno={handleNovoTurno}
      />
      <EditarTurnoDialog
        isOpen={dialogoEdicaoAberto}
        onOpenChange={setDialogoEdicaoAberto}
        turno={turnoSelecionado}
        onSave={handleSalvarEdicao}
      />
    </div>
  );
};

export default TurnosForm;