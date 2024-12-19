import React from 'react';
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import CompanySelect from '../user/CompanySelect';
import TurnoSelect from '../user/TurnoSelect';
import SetorSelect from '../user/SetorSelect';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMealTypes } from '@/hooks/useMealTypes';

const ReportsTFilters = ({ onFilterChange, filters }) => {
  const { data: mealTypes } = useMealTypes();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <Label className="text-sm font-medium mb-2 block">Empresa</Label>
        <CompanySelect 
          includeAllOption={true}
          value={filters?.company}
          onValueChange={(value) => onFilterChange('company', value)} 
        />
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">Data Inicial</Label>
        <DatePicker
          date={filters?.startDate}
          onDateChange={(date) => onFilterChange('startDate', date)}
        />
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">Data Final</Label>
        <DatePicker
          date={filters?.endDate}
          onDateChange={(date) => onFilterChange('endDate', date)}
        />
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">Turno</Label>
        <TurnoSelect 
          includeAllOption={true}
          value={filters?.shift}
          onValueChange={(value) => onFilterChange('shift', value)}
        />
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">Setor</Label>
        <SetorSelect 
          includeAllOption={true}
          value={filters?.sector}
          onValueChange={(value) => onFilterChange('sector', value)}
        />
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">Tipo de Refeição</Label>
        <Select 
          value={filters?.mealType} 
          onValueChange={(value) => onFilterChange('mealType', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {mealTypes?.map((tipo) => (
              <SelectItem key={tipo.id} value={tipo.id}>
                {tipo.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ReportsTFilters;