import React from 'react';
import ReportsTFilters from './ReportsTFilters';
import ReportsTCharts from './ReportsTCharts';
import { useReportsTFilters } from './hooks/useReportsTFilters';
import ExportTButton from './components/ExportTButton';

const ReportsTForm = () => {
  const { filters, handleFilterChange, data } = useReportsTFilters();

  if (data === undefined || !data) {
    return <div>Carregando dados...</div>;
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Filtros</h2>
        <ExportTButton filters={filters} />
      </div>
      <ReportsTFilters onFilterChange={handleFilterChange} filters={filters} />
      <ReportsTCharts filters={filters} />
      <div className="text-red-500">
        {filters.startDate && filters.endDate && !data.length && <p>Nenhum registro encontrado para o período selecionado.</p>}
      </div>
    </div>
  );
};

export default ReportsTForm;