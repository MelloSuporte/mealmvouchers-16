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
import { Alert, AlertDescription } from "@/components/ui/alert";

const ReportMetrics = () => {
  const { filters, handleFilterChange } = useReportFilters();
  const { data: metrics, isLoading, error, refetch } = useReportMetrics(filters);

  const handleExportClick = async () => {
    try {
      if (!metrics?.filteredData?.length) {
        toast.error("Não há dados para exportar no período selecionado");
        return;
      }

      console.log('Iniciando exportação com dados:', {
        metricsLength: metrics?.filteredData?.length,
        filters,
        metrics
      });

      await exportToPDF(metrics, filters);
      toast.success("Relatório exportado com sucesso!");
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast.error("Erro ao exportar relatório: " + error.message);
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertDescription>
            Erro ao carregar dados: {error.message}
            <Button 
              onClick={() => refetch()} 
              variant="outline" 
              className="ml-2"
            >
              Tentar novamente
            </Button>
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
        <Button 
          onClick={handleExportClick}
          className="ml-4"
          disabled={!metrics?.filteredData?.length || isLoading}
        >
          <FileDown className="mr-2 h-4 w-4" />
          Exportar Relatório
        </Button>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : metrics?.filteredData?.length === 0 ? (
        <Alert>
          <AlertDescription>
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