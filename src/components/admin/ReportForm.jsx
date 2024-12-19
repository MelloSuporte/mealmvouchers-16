import React from 'react';
import ReportMetrics from './reports/ReportMetrics';
import ChartTabs from './reports/ChartTabs';
import ReportFilters from './reports/ReportFilters';
import { useReportData } from './reports/hooks/useReportData';
import ExportButton from './reports/components/ExportButton';
import { useAdmin } from '@/contexts/AdminContext';

const ReportForm = () => {
  const { user } = useAdmin();
  const { filters, handleFilterChange } = useReportData();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Relatório de Uso</h2>
        <ExportButton filters={filters} userName={user?.email} />
      </div>

      <ReportFilters 
        onFilterChange={handleFilterChange}
        filters={filters}
      />
      
      <ReportMetrics filters={filters} />
      <ChartTabs filters={filters} />
    </div>
  );
};

export default ReportForm;