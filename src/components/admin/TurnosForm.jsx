import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const TurnosForm = () => {
  const [turnos, setTurnos] = useState([
    { id: "central", label: "Turno Central", entrada: "08:00", saida: "17:00" },
    { id: "primeiro", label: "Primeiro Turno", entrada: "06:00", saida: "14:00" },
    { id: "segundo", label: "Segundo Turno", entrada: "14:00", saida: "22:00" },
    { id: "terceiro", label: "Terceiro Turno", entrada: "22:00", saida: "06:00" },
  ]);

  const handleTurnoChange = (id, field, value) => {
    setTurnos(turnos.map(turno => 
      turno.id === id ? { ...turno, [field]: value } : turno
    ));
  };

  const handleSaveTurnos = () => {
    console.log('Salvando turnos:', turnos);
    toast.success("Turnos salvos com sucesso!");
  };

  return (
    <form className="space-y-4">
      {turnos.map((turno) => (
        <div key={turno.id} className="space-y-2">
          <Label>{turno.label}</Label>
          <div className="flex space-x-2">
            <Input
              type="time"
              value={turno.entrada}
              onChange={(e) => handleTurnoChange(turno.id, 'entrada', e.target.value)}
              placeholder="Entrada"
            />
            <Input
              type="time"
              value={turno.saida}
              onChange={(e) => handleTurnoChange(turno.id, 'saida', e.target.value)}
              placeholder="Saída"
            />
          </div>
        </div>
      ))}
      <Button type="button" onClick={handleSaveTurnos}>Salvar Turnos</Button>
    </form>
  );
};

export default TurnosForm;