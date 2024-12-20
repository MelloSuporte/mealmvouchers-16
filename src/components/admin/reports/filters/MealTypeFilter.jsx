import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MealTypeFilter = ({ filterOptions, handleFilterChange }) => {
  return (
    <div>
      <Label className="text-sm font-medium mb-2 block">Tipo de Refeição</Label>
      <Select onValueChange={(value) => handleFilterChange('mealType', value)}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione o tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          {filterOptions?.tiposRefeicao?.map((tipo) => (
            <SelectItem key={tipo.id} value={tipo.id}>
              {tipo.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default MealTypeFilter;