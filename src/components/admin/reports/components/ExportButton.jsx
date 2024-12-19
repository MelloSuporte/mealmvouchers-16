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

      // Verifica se há dados válidos para exportar
      if (!metrics?.data || metrics.data.length === 0) {
        toast.error("Não há dados para exportar no período selecionado");
        return;
      }

      await exportToPDF(metrics, filters);
      toast.success("Relatório exportado com sucesso!");
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast.error("Erro ao exportar relatório: " + error.message);
    }
  };

  // Habilita o botão quando houver dados disponíveis
  const isDisabled = isLoading || !metrics?.data || metrics.data.length === 0;

  return (
    <Button 
      onClick={handleExportClick}
      className="ml-4 bg-primary hover:bg-primary/90"
      disabled={isDisabled}
    >
      <FileDown className="mr-2 h-4 w-4" />
      Exportar Relatório
    </Button>
  );
};

export default ExportButton;