import React, { useState } from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const TurnoForm = () => {
  const [selectedTurno, setSelectedTurno] = useState("");

  const turnos = [
    { id: "primeiro", label: "Primeiro Turno", horario: "06:00 - 14:00", refeicoes: "Café (1) ou Café (2) + Almoço" },
    { id: "segundo", label: "Segundo Turno", horario: "14:00 - 22:00", refeicoes: "Jantar + Lanche" },
    { id: "terceiro", label: "Terceiro Turno", horario: "22:00 - 06:00", refeicoes: "Ceia + Desjejum" },
  ];

  return (
    <div className="space-y-2">
      <Label>Turno</Label>
      <RadioGroup value={selectedTurno} onValueChange={setSelectedTurno}>
        {turnos.map((turno) => (
          <div key={turno.id} className="flex items-center space-x-2 p-2 border rounded">
            <RadioGroupItem value={turno.id} id={turno.id} />
            <Label htmlFor={turno.id} className="flex-grow">
              <span className="font-bold">{turno.label}</span>
              <span className="block text-sm text-gray-500">{turno.horario}</span>
              <span className="block text-sm text-gray-500">{turno.refeicoes}</span>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

export default TurnoForm;