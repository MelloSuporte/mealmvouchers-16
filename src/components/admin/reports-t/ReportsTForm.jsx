import React from 'react';
import ReportsTFilters from './ReportsTFilters';
import ReportsTCharts from './ReportsTCharts';
import { useReportsTFilters } from './hooks/useReportsTFilters';
import ExportTButton from './components/ExportTButton';

const ReportsTForm = () => {
  const { filters, handleFilterChange } = useReportsTFilters();

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Filtros</h2>
        <ExportTButton filters={filters} />
      </div>
      <ReportsTFilters onFilterChange={handleFilterChange} filters={filters} />
      <ReportsTCharts filters={filters} />
    </div>
  );
};

export default ReportsTForm;