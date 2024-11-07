import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "../utils/api";
import { Loader2 } from "lucide-react";

const Turnos = () => {
  const { data: turnos = [], isLoading, error } = useQuery({
    queryKey: ['turnos'],
    queryFn: async () => {
      try {
        const response = await api.get('/shift-configurations');
        return response.data;
      } catch (error) {
        toast.error('Erro ao carregar configurações dos turnos');
        throw error;
      }
    }
  });

  const handleTurnoChange = async (id, field, value) => {
    try {
      await api.put(`/shift-configurations/${id}`, {
        [field]: value
      });
      toast.success('Turno atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar turno');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <p className="text-red-500">Erro ao carregar turnos</p>
      </div>
    );
  }

  const turnoLabels = {
    'central': 'Turno Central (Administrativo)',
    'primeiro': 'Primeiro Turno',
    'segundo': 'Segundo Turno',
    'terceiro': 'Terceiro Turno'
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Configuração de Turnos</h1>
      
      <div className="grid gap-6">
        {Object.entries(turnoLabels).map(([key, label]) => {
          const turno = turnos.find(t => t.shift_type === key) || {};
          
          return (
            <Card key={key}>
              <CardHeader>
                <CardTitle>{label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor={`entrada-${key}`}>Horário de Entrada</Label>
                    <Input
                      id={`entrada-${key}`}
                      type="time"
                      value={turno.start_time || ''}
                      onChange={(e) => handleTurnoChange(turno.id, 'start_time', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`saida-${key}`}>Horário de Saída</Label>
                    <Input
                      id={`saida-${key}`}
                      type="time"
                      value={turno.end_time || ''}
                      onChange={(e) => handleTurnoChange(turno.id, 'end_time', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Status do Turno</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={turno.is_active}
                        onCheckedChange={(checked) => handleTurnoChange(turno.id, 'is_active', checked)}
                      />
                      <Label>{turno.is_active ? 'Ativo' : 'Inativo'}</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Turnos;