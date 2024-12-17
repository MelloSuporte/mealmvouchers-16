import React from 'react';
import { Button } from "@/components/ui/button";
import { FileDown } from 'lucide-react';
import { toast } from "sonner";
import { exportToPDF } from '../utils/pdfExport';

const ExportButton = ({ metrics, filters, isLoading }) => {
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

  return (
    <Button 
      onClick={handleExportClick}
      className="ml-4"
      disabled={!metrics?.filteredData?.length || isLoading}
    >
      <FileDown className="mr-2 h-4 w-4" />
      Exportar Relatório
    </Button>
  );
};

export default ExportButton;