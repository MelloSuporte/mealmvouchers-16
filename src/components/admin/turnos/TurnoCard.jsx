import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

const TurnoCard = ({ turno, onTurnoChange, isSubmitting }) => {
  const getTurnoLabel = (tipoTurno) => {
    const labels = {
      'central': 'Turno Central (Administrativo)',
      'primeiro': 'Primeiro Turno',
      'segundo': 'Segundo Turno',
      'terceiro': 'Terceiro Turno'
    };
    return labels[tipoTurno] || tipoTurno;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{getTurnoLabel(turno.tipo)}</CardTitle>
          {isSubmitting && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
        <CardDescription>Configure os horários de entrada e saída</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`entrada-${turno.id}`}>Horário de Entrada</Label>
            <Input
              id={`entrada-${turno.id}`}
              type="time"
              value={turno.hora_inicio}
              onChange={(e) => onTurnoChange(turno.id, 'hora_inicio', e.target.value)}
              className="w-full"
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`saida-${turno.id}`}>Horário de Saída</Label>
            <Input
              id={`saida-${turno.id}`}
              type="time"
              value={turno.hora_fim}
              onChange={(e) => onTurnoChange(turno.id, 'hora_fim', e.target.value)}
              className="w-full"
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`ativo-${turno.id}`}>Status do Turno</Label>
            <div className="flex items-center space-x-2">
              <Switch
                id={`ativo-${turno.id}`}
                checked={turno.ativo}
                onCheckedChange={(checked) => onTurnoChange(turno.id, 'ativo', checked)}
                disabled={isSubmitting}
              />
              <Label htmlFor={`ativo-${turno.id}`}>
                {turno.ativo ? 'Ativo' : 'Inativo'}
              </Label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TurnoCard;