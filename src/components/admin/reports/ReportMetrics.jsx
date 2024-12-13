import React, { useState } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { startOfDay, endOfDay } from 'date-fns';
import ReportFilters from './ReportFilters';
import MetricsCards from './MetricsCards';
import { Button } from "@/components/ui/button";
import { FileDown } from 'lucide-react';
import { useReportMetrics } from './hooks/useReportMetrics';
import { exportToPDF } from './utils/pdfExport';

const ReportMetrics = () => {
  const [filters, setFilters] = useState({
    company: 'all',
    startDate: startOfDay(new Date()),
    endDate: endOfDay(new Date()),
    shift: 'all',
    mealType: 'all'
  });

  const { data: metrics, isLoading } = useReportMetrics(filters);

  const handleFilterChange = (filterType, value) => {
    console.log('Alterando filtro:', filterType, 'para:', value);
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleExportClick = () => {
    if (!metrics?.filteredData?.length) {
      toast.error("Não há dados para exportar");
      return;
    }
    exportToPDF(metrics, filters);
  };

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