import React from 'react';
import { useFilterOptions } from './hooks/useFilterOptions';
import { Skeleton } from "@/components/ui/skeleton";
import CompanyDateFilters from './filters/CompanyDateFilters';
import ShiftSectorFilters from './filters/ShiftSectorFilters';
import MealTypeFilter from './filters/MealTypeFilter';

const ReportFilters = ({ onFilterChange, startDate, endDate }) => {
  const { data: filterOptions, isLoading, error } = useFilterOptions();

  const handleFilterChange = (type, value, displayName = '') => {
    try {
      console.log('Alterando filtro:', { type, value, displayName });
      onFilterChange(type, value, displayName);
    } catch (error) {
      console.error('Erro ao alterar filtro:', error);
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
      <CompanyDateFilters 
        filterOptions={filterOptions}
        handleFilterChange={handleFilterChange}
        startDate={startDate}
        endDate={endDate}
      />
      <ShiftSectorFilters 
        filterOptions={filterOptions}
        handleFilterChange={handleFilterChange}
      />
      <MealTypeFilter 
        filterOptions={filterOptions}
        handleFilterChange={handleFilterChange}
      />
    </div>
  );
};

export default ReportFilters;