import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ShiftSectorFilters = ({ filterOptions, handleFilterChange }) => {
  return (
    <>
      <div>
        <Label className="text-sm font-medium mb-2 block">Turno</Label>
        <Select onValueChange={(value) => handleFilterChange('shift', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o turno" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {filterOptions?.turnos?.map((turno) => (
              <SelectItem key={turno.id} value={turno.id}>
                {turno.tipo_turno}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">Setor</Label>
        <Select onValueChange={(value) => handleFilterChange('sector', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o setor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {filterOptions?.setores?.map((setor) => (
              <SelectItem key={setor.id} value={setor.id}>
                {setor.nome_setor}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
};

export default ShiftSectorFilters;