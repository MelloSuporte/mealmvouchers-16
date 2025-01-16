import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DateRangeFilter from './filters/DateRangeFilter';
import VoucherTypeFilter from './filters/VoucherTypeFilter';
import CompanyFilter from './filters/CompanyFilter';
import ShiftFilter from './filters/ShiftFilter';

const ReportsTFilters = ({ onFilterChange, filters }) => {
  const { data: sectors } = useQuery({
    queryKey: ['sectors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('setores')
        .select('*')
        .order('nome_setor');
      if (error) throw error;
      return data;
    }
  });

  const { data: mealTypes } = useQuery({
    queryKey: ['meal-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tipos_refeicao')
        .select('*')
        .eq('ativo', true)
        .order('nome');
      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg border">
      <div className="grid gap-4 md:grid-cols-2">
        <DateRangeFilter 
          filters={filters} 
          onFilterChange={onFilterChange} 
        />
        
        <VoucherTypeFilter 
          value={filters.voucherType}
          onChange={(value) => onFilterChange('voucherType', value)}
        />

        <CompanyFilter 
          value={filters.company}
          onChange={(value) => onFilterChange('company', value)}
        />

        <ShiftFilter 
          value={filters.shift}
          onChange={(value) => onFilterChange('shift', value)}
        />

        <div className="space-y-2">
          <Label>Setor</Label>
          <Select
            value={filters.sector}
            onValueChange={(value) => onFilterChange('sector', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o setor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {sectors?.map((sector) => (
                <SelectItem key={sector.id} value={sector.nome_setor}>
                  {sector.nome_setor}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Tipo de Refeição</Label>
          <Select
            value={filters.mealType}
            onValueChange={(value) => onFilterChange('mealType', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {mealTypes?.map((type) => (
                <SelectItem key={type.id} value={type.nome}>
                  {type.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default ReportsTFilters;