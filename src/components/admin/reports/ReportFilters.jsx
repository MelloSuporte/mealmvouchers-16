import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { useFilterOptions } from './hooks/useFilterOptions';
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { isAfter, isBefore } from 'date-fns';

const ReportFilters = ({ onFilterChange, startDate, endDate }) => {
  const { data: filterOptions, isLoading, error } = useFilterOptions();

  const handleDateChange = (type, date) => {
    try {
      console.log(`Alterando data ${type}:`, date);
      
      if (!date || isNaN(date.getTime())) {
        toast.error("Data inválida");
        return;
      }

      // Validações específicas
      if (type === 'startDate' && endDate && isAfter(date, endDate)) {
        toast.error("Data inicial não pode ser maior que a data final");
        return;
      }

      if (type === 'endDate' && startDate && isBefore(date, startDate)) {
        toast.error("Data final não pode ser menor que a data inicial");
        return;
      }

      onFilterChange(type, date);
    } catch (error) {
      console.error('Erro ao alterar data:', error);
      toast.error('Erro ao atualizar data');
    }
  };

  const handleFilterChange = (type, value) => {
    try {
      console.log(`Alterando filtro ${type}:`, value);
      
      // Encontra o nome do item selecionado
      let itemName = '';
      if (value !== 'all') {
        switch (type) {
          case 'company':
            itemName = filterOptions?.empresas?.find(e => e.id === value)?.nome;
            break;
          case 'shift':
            itemName = filterOptions?.turnos?.find(t => t.id === value)?.tipo_turno;
            break;
          case 'sector':
            itemName = filterOptions?.setores?.find(s => s.id === value)?.nome_setor;
            break;
          case 'mealType':
            itemName = filterOptions?.tiposRefeicao?.find(tr => tr.id === value)?.nome;
            break;
        }
      }

      // Passa tanto o valor quanto o nome para o filtro
      onFilterChange(type, value, itemName);
    } catch (error) {
      console.error('Erro ao alterar filtro:', error);
      toast.error('Erro ao atualizar filtro');
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-[70px]" />
        ))}
      </div>
    );
  }

  if (error) {
    console.error('Erro ao carregar filtros:', error);
    return (
      <div className="text-red-500 p-4 bg-red-50 rounded-md mb-8">
        <p>Erro ao carregar filtros: {error.message}</p>
        <p className="text-sm mt-2">Por favor, verifique se há dados cadastrados e tente novamente.</p>
      </div>
    );
  }

  const hasNoData = (!filterOptions?.empresas?.length && !filterOptions?.turnos?.length && !filterOptions?.tiposRefeicao?.length && !filterOptions?.setores?.length);
  
  if (hasNoData) {
    return (
      <div className="bg-yellow-50 p-4 rounded-md mb-8">
        <p className="text-yellow-700">
          Nenhum dado encontrado para os filtros. Verifique se existem empresas, turnos, setores e tipos de refeição cadastrados e ativos.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
      <div>
        <Label className="text-sm font-medium mb-2 block">Empresa</Label>
        <Select onValueChange={(value) => handleFilterChange('company', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a empresa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {filterOptions?.empresas?.map((empresa) => (
              <SelectItem key={empresa.id} value={empresa.id}>
                {empresa.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">Data Inicial</Label>
        <DatePicker
          date={startDate}
          onDateChange={(date) => handleDateChange('startDate', date)}
        />
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">Data Final</Label>
        <DatePicker
          date={endDate}
          onDateChange={(date) => handleDateChange('endDate', date)}
        />
      </div>

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
    </div>
  );
};

export default ReportFilters;