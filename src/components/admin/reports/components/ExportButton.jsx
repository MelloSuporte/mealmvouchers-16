import React from 'react';
import { Button } from "@/components/ui/button";
import { FileDown } from 'lucide-react';
import { toast } from "sonner";
import { exportToPDF } from '../utils/pdfExport';
import logger from '@/config/logger';

const ExportButton = ({ filters, userName }) => {
  const handleExportClick = async () => {
    try {
      logger.info('Iniciando exportação com filtros:', filters);

      const filtersWithUser = {
        ...filters,
        userName: userName || 'Usuário do Sistema'
      };

      await exportToPDF({
        data: [], 
        totalCost: 0,
        averageCost: 0
      }, filtersWithUser);

      toast.success("Relatório exportado com sucesso!");
    } catch (error) {
      logger.error('Erro ao exportar:', error);
      toast.error("Erro ao exportar relatório: " + error.message);
    }
  };

  return (
    <Button 
      onClick={handleExportClick}
      className="bg-primary hover:bg-primary/90"
    >
      <FileDown className="mr-2 h-4 w-4" />
      Exportar Relatório
    </Button>
  );
};

export default ExportButton;