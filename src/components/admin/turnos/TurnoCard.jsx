import React from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";

const TurnoCard = ({ turno, onTurnoChange, isSubmitting }) => {
  const getTurnoLabel = (shiftType) => {
    const labels = {
      'central': 'Turno Central (Administrativo)',
      'primeiro': 'Primeiro Turno',
      'segundo': 'Segundo Turno',
      'terceiro': 'Terceiro Turno'
    };
    return labels[shiftType] || shiftType;
  };

  return (
    <Card className="p-6 shadow-md hover:shadow-lg transition-shadow">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {getTurnoLabel(turno.tipo_turno)}
          </h3>
          {isSubmitting && (
            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`start-time-${turno.id}`}>Horário de Entrada</Label>
            <Input
              id={`start-time-${turno.id}`}
              type="time"
              value={turno.hora_inicio}
              onChange={(e) => onTurnoChange(turno.id, 'hora_inicio', e.target.value)}
              className="w-full"
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`end-time-${turno.id}`}>Horário de Saída</Label>
            <Input
              id={`end-time-${turno.id}`}
              type="time"
              value={turno.hora_fim}
              onChange={(e) => onTurnoChange(turno.id, 'hora_fim', e.target.value)}
              className="w-full"
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <div className="flex items-center space-x-2">
              <Switch
                id={`active-${turno.id}`}
                checked={turno.ativo}
                onCheckedChange={(checked) => onTurnoChange(turno.id, 'ativo', checked)}
                disabled={isSubmitting}
              />
              <Label htmlFor={`active-${turno.id}`}>
                {turno.ativo ? 'Ativo' : 'Inativo'}
              </Label>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TurnoCard;