import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/utils/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TurnosForm = () => {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTurno, setNewTurno] = useState({
    shift_type: '',
    start_time: '',
    end_time: '',
    is_active: true
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['shift-configurations'],
    queryFn: async () => {
      const response = await api.get('/shift-configurations');
      return response.data || [];
    }
  });

  // Ensure turnos is always an array
  const turnos = Array.isArray(data) ? data : [];

  const updateTurnosMutation = useMutation({
    mutationFn: async (updatedTurno) => {
      const response = await api.put(`/shift-configurations/${updatedTurno.id}`, updatedTurno);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['shift-configurations']);
      toast.success("Horário do turno atualizado com sucesso!");
      setIsSubmitting(false);
    },
    onError: (error) => {
      toast.error("Erro ao atualizar turno: " + error.message);
      setIsSubmitting(false);
    }
  });

  const createTurnoMutation = useMutation({
    mutationFn: async (newTurno) => {
      const response = await api.post('/shift-configurations', newTurno);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['shift-configurations']);
      toast.success("Novo turno criado com sucesso!");
      setIsDialogOpen(false);
      setNewTurno({
        shift_type: '',
        start_time: '',
        end_time: '',
        is_active: true
      });
    },
    onError: (error) => {
      toast.error("Erro ao criar turno: " + error.message);
    }
  });

  const handleTurnoChange = (id, field, value) => {
    if (isSubmitting) {
      toast.warning("Aguarde, processando alteração anterior...");
      return;
    }

    setIsSubmitting(true);
    const turno = turnos.find(t => t.id === id);
    
    if (field === 'start_time' && turno.end_time && value >= turno.end_time) {
      toast.error("Horário de entrada deve ser menor que o de saída");
      setIsSubmitting(false);
      return;
    }
    if (field === 'end_time' && turno.start_time && value <= turno.start_time) {
      toast.error("Horário de saída deve ser maior que o de entrada");
      setIsSubmitting(false);
      return;
    }

    const updatedTurno = {
      ...turno,
      [field]: value
    };

    updateTurnosMutation.mutate(updatedTurno);
  };

  const handleCreateTurno = () => {
    if (!newTurno.shift_type || !newTurno.start_time || !newTurno.end_time) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (newTurno.start_time >= newTurno.end_time) {
      toast.error("Horário de entrada deve ser menor que o de saída");
      return;
    }

    createTurnoMutation.mutate(newTurno);
  };

  const getTurnoLabel = (shiftType) => {
    const labels = {
      'central': 'Turno Central (Administrativo)',
      'primeiro': 'Primeiro Turno',
      'segundo': 'Segundo Turno',
      'terceiro': 'Terceiro Turno'
    };
    return labels[shiftType] || shiftType;
  };

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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Configuração de Turnos</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Turno
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Turno</DialogTitle>
              <DialogDescription>
                Preencha as informações para criar um novo turno
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo de Turno</Label>
                <Select
                  value={newTurno.shift_type}
                  onValueChange={(value) => setNewTurno({ ...newTurno, shift_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de turno" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="central">Turno Central (Administrativo)</SelectItem>
                    <SelectItem value="primeiro">Primeiro Turno</SelectItem>
                    <SelectItem value="segundo">Segundo Turno</SelectItem>
                    <SelectItem value="terceiro">Terceiro Turno</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Horário de Entrada</Label>
                <Input
                  type="time"
                  value={newTurno.start_time}
                  onChange={(e) => setNewTurno({ ...newTurno, start_time: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Horário de Saída</Label>
                <Input
                  type="time"
                  value={newTurno.end_time}
                  onChange={(e) => setNewTurno({ ...newTurno, end_time: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={newTurno.is_active}
                  onCheckedChange={(checked) => setNewTurno({ ...newTurno, is_active: checked })}
                />
                <Label>Turno Ativo</Label>
              </div>
              <Button onClick={handleCreateTurno} className="w-full">
                Criar Turno
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {turnos.map((turno) => (
          <Card key={turno.id}>
            <CardHeader>
              <CardTitle>{getTurnoLabel(turno.shift_type)}</CardTitle>
              <CardDescription>Configure os horários de entrada e saída</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`entrada-${turno.id}`}>Horário de Entrada</Label>
                  <Input
                    id={`entrada-${turno.id}`}
                    type="time"
                    value={turno.start_time}
                    onChange={(e) => handleTurnoChange(turno.id, 'start_time', e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`saida-${turno.id}`}>Horário de Saída</Label>
                  <Input
                    id={`saida-${turno.id}`}
                    type="time"
                    value={turno.end_time}
                    onChange={(e) => handleTurnoChange(turno.id, 'end_time', e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`active-${turno.id}`}>Status do Turno</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`active-${turno.id}`}
                      checked={turno.is_active}
                      onCheckedChange={(checked) => handleTurnoChange(turno.id, 'is_active', checked)}
                    />
                    <Label htmlFor={`active-${turno.id}`}>
                      {turno.is_active ? 'Ativo' : 'Inativo'}
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TurnosForm;