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
      'first': 'Primeiro Turno',
      'second': 'Segundo Turno',
      'third': 'Terceiro Turno'
    };
    return labels[shiftType] || shiftType;
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {getTurnoLabel(turno.shift_type)}
          </h3>
          {isSubmitting && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Horário de Entrada</Label>
            <Input
              type="time"
              value={turno.start_time}
              onChange={(e) => onTurnoChange(turno.id, 'start_time', e.target.value)}
              className="w-full"
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label>Horário de Saída</Label>
            <Input
              type="time"
              value={turno.end_time}
              onChange={(e) => onTurnoChange(turno.id, 'end_time', e.target.value)}
              className="w-full"
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <div className="flex items-center space-x-2">
              <Switch
                id={`active-${turno.id}`}
                checked={turno.is_active}
                onCheckedChange={(checked) => onTurnoChange(turno.id, 'is_active', checked)}
                disabled={isSubmitting}
              />
              <Label htmlFor={`active-${turno.id}`}>
                {turno.is_active ? 'Ativo' : 'Inativo'}
              </Label>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TurnoCard;