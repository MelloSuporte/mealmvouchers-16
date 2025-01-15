import React from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, FileSpreadsheet, FileText, BarChart } from "lucide-react";
import ReportsTCharts from './ReportsTCharts';
import ReportsTFilters from './ReportsTFilters';
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
      <div className="p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar dados: {error.message}
          </AlertDescription>
        </Alert>
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
    </div>
  );
};

export default ReportsTForm;