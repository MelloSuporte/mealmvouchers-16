import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TurnoSelect = ({ value, onValueChange, turnos = [], isLoadingTurnos }) => {
  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
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

  return (
    <Select 
      value={value?.toString()}
      onValueChange={onValueChange}
      disabled={isLoadingTurnos}
    >
      <SelectTrigger className="w-full h-8 text-sm">
        <SelectValue placeholder={isLoadingTurnos ? "Carregando turnos..." : "Selecione o turno"} />
      </SelectTrigger>
      <SelectContent>
        {turnos && turnos.length > 0 ? (
          turnos
            .filter(turno => turno.ativo)
            .map((turno) => (
              <SelectItem 
                key={turno.id} 
                value={turno.id.toString()}
              >
                {`${getTurnoLabel(turno.tipo_turno)} (${formatTime(turno.horario_inicio)} - ${formatTime(turno.horario_fim)})`}
              </SelectItem>
            ))
        ) : (
          <SelectItem value="no-turnos" disabled>
            Nenhum turno disponível
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
};

export default TurnoSelect;