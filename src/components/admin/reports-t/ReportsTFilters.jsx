import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DatePickerWithRange } from "@/components/ui/date-picker";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';

const ReportsTFilters = ({ onFilterChange, filters }) => {
  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('empresas')
        .select('*')
        .eq('ativo', true)
        .order('nome');
      if (error) throw error;
      return data;
    }
  });

  const { data: shifts } = useQuery({
    queryKey: ['shifts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('turnos')
        .select('*')
        .eq('ativo', true)
        .order('id');
      if (error) throw error;
      return data;
    }
  });

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
        <div className="space-y-2">
          <Label>Período</Label>
          <DatePickerWithRange 
            date={{
              from: filters.startDate,
              to: filters.endDate
            }}
            onSelect={(range) => {
              onFilterChange('startDate', range?.from);
              onFilterChange('endDate', range?.to);
            }}
          />
        </div>

        <div className="space-y-2">
          <Label>Empresa</Label>
          <Select
            value={filters.company}
            onValueChange={(value) => onFilterChange('company', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a empresa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {companies?.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Turno</Label>
          <Select
            value={filters.shift}
            onValueChange={(value) => onFilterChange('shift', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o turno" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {shifts?.map((shift) => (
                <SelectItem key={shift.id} value={shift.tipo_turno}>
                  {shift.tipo_turno}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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