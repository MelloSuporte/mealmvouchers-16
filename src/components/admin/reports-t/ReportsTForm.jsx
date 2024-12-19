import React from 'react';
import ReportsTFilters from './ReportsTFilters';
import ReportsTCharts from './ReportsTCharts';
import { useReportsTFilters } from './hooks/useReportsTFilters';
import ExportTButton from './components/ExportTButton';

const ReportsTForm = () => {
  const { filters, handleFilterChange, data, isLoading, error } = useReportsTFilters();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">Erro ao carregar dados: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Filtros</h2>
        <ExportTButton filters={filters} />
      </div>
      <ReportsTFilters onFilterChange={handleFilterChange} filters={filters} />
      <ReportsTCharts filters={filters} />
      {filters.startDate && filters.endDate && (!data || data.length === 0) && (
        <div className="text-center p-4 text-gray-500">
          Nenhum registro encontrado para o período selecionado.
          <br />
          Tente ajustar os filtros ou selecione um período diferente.
        </div>
      )}
    </div>
  );
};

export default ReportsTForm;