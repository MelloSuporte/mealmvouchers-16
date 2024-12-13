import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import ReportFilters from './ReportFilters';
import MetricsCards from './MetricsCards';
import { Button } from "@/components/ui/button";
import { FileDown } from 'lucide-react';
import { useReportMetrics } from './hooks/useReportMetrics';
import { exportToPDF } from './utils/pdfExport';
import { useReportFilters } from './hooks/useReportFilters';
import { toast } from "sonner";

const ReportMetrics = () => {
  const { filters, handleFilterChange } = useReportFilters();
  const { data: metrics, isLoading, error } = useReportMetrics(filters);

  const handleExportClick = () => {
    try {
      if (!metrics?.filteredData?.length) {
        toast.error("Não há dados para exportar");
        return;
      }

      console.log('Iniciando exportação com dados:', {
        metricsLength: metrics?.filteredData?.length,
        filters,
        metrics
      });

      exportToPDF(metrics, filters);
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast.error("Erro ao exportar relatório: " + error.message);
    }
  };

  if (error) {
    console.error('Erro ao carregar métricas:', error);
    toast.error("Erro ao carregar dados do relatório");
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <ReportFilters 
            metrics={metrics} 
            onFilterChange={handleFilterChange}
            startDate={filters.startDate}
            endDate={filters.endDate}
          />
        </div>
        <Button 
          onClick={handleExportClick}
          className="ml-4"
          disabled={!metrics?.filteredData?.length}
        >
          <FileDown className="mr-2 h-4 w-4" />
          Exportar Relatório
        </Button>
      </div>
      <MetricsCards metrics={metrics} />
    </div>
  );
};

export default ReportMetrics;