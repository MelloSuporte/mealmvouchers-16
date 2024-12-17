import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import ReportFilters from './ReportFilters';
import MetricsCards from './MetricsCards';
import ExportButton from './components/ExportButton';
import LoadingMetrics from './components/LoadingMetrics';
import { useReportFilters } from './hooks/useReportFilters';
import { useUsageData } from './hooks/useUsageData';
import { useMetricsCalculation } from './hooks/useMetricsCalculation';

const ReportMetrics = () => {
  const { filters, handleFilterChange } = useReportFilters();
  const { data: usageData, isLoading: isLoadingUsage, error: usageError } = useUsageData(filters);
  const metrics = useMetricsCalculation(usageData);

  if (usageError) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertDescription>
            Erro ao carregar dados: {usageError.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <ReportFilters 
            onFilterChange={handleFilterChange}
            startDate={filters.startDate}
            endDate={filters.endDate}
          />
        </div>
        <ExportButton 
          metrics={metrics}
          filters={filters}
          isLoading={isLoadingUsage}
          className="ml-4"
        />
      </div>
      
      {isLoadingUsage ? (
        <LoadingMetrics />
      ) : usageData?.length === 0 ? (
        <Alert className="bg-gray-50 border-gray-200">
          <AlertDescription className="text-gray-600 text-center py-4">
            Nenhum dado encontrado para o período e filtros selecionados.
          </AlertDescription>
        </Alert>
      ) : (
        <MetricsCards metrics={metrics} />
      )}
    </div>
  );
};

export default ReportMetrics;