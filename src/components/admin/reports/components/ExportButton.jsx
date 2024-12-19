import React from 'react';
import { Button } from "@/components/ui/button";
import { FileDown } from 'lucide-react';
import { toast } from "sonner";
import { exportToPDF } from '../utils/pdfExport';

const ExportButton = ({ metrics, filters, isLoading }) => {
  const handleExportClick = async () => {
    try {
      console.log('Iniciando exportação com dados:', {
        dataLength: metrics?.data?.length,
        filters,
        metrics
      });

      // Mesmo sem dados, permitimos a exportação
      if (!metrics?.data || metrics.data.length === 0) {
        const doc = await exportToPDF({
          ...metrics,
          data: [], // Garante que data é um array vazio
          totalCost: 0,
          averageCost: 0
        }, filters);
        toast.success("Relatório exportado com sucesso!");
        return;
      }

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
      className="ml-4 bg-primary hover:bg-primary/90"
    >
      <FileDown className="mr-2 h-4 w-4" />
      Exportar Relatório
    </Button>
  );
};

export default ExportButton;