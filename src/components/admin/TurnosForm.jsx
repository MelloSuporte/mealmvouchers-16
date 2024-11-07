import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import api from "@/utils/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Plus } from "lucide-react";
import TurnoCard from './turnos/TurnoCard';
import NewTurnoDialog from './turnos/NewTurnoDialog';
import { useTurnosActions } from './turnos/useTurnosActions';

const TurnosForm = () => {
  const [isNewTurnoDialogOpen, setIsNewTurnoDialogOpen] = useState(false);
  const [newTurno, setNewTurno] = useState({
    shift_type: '',
    start_time: '',
    end_time: '',
    is_active: true
  });

  const { data: turnos = [], isLoading, error, refetch } = useQuery({
    queryKey: ['shift-configurations'],
    queryFn: async () => {
      const response = await api.get('/shift-configurations');
      return response.data || [];
    }
  });

  const { handleTurnoChange, handleCreateTurno, submittingTurnoId } = useTurnosActions();

  if (error) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertDescription>
            Erro ao carregar configurações dos turnos.
            <Button 
              variant="link" 
              onClick={() => refetch()} 
              className="pl-2"
            >
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Carregando configurações dos turnos...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Configuração de Turnos</h2>
        <Button onClick={() => setIsNewTurnoDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Turno
        </Button>
      </div>
      
      <NewTurnoDialog
        isOpen={isNewTurnoDialogOpen}
        onOpenChange={setIsNewTurnoDialogOpen}
        newTurno={newTurno}
        setNewTurno={setNewTurno}
        onCreateTurno={handleCreateTurno}
      />
      
      <div className="grid gap-4">
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