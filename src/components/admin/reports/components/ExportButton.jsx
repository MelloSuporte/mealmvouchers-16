import React from 'react';
import { Button } from "@/components/ui/button";
import { FileDown } from 'lucide-react';
import { toast } from "sonner";
import { exportToPDF } from '../utils/pdfExport';
import logger from '@/config/logger';

const ExportButton = ({ metrics, filters, isLoading }) => {
  const handleExportClick = async () => {
    try {
      logger.info('Iniciando exportação com dados:', {
        metricsLength: metrics?.data?.length,
        filters,
        totalCost: metrics?.totalCost,
        averageCost: metrics?.averageCost
      });

      // Mesmo sem dados, permitimos a exportação
      if (!metrics?.data || metrics.data.length === 0) {
        logger.info('Exportando relatório vazio');
        const doc = await exportToPDF({
          ...metrics,
          data: [], // Garante que data é um array vazio
          totalCost: 0,
          averageCost: 0
        }, filters);
        logger.info('Relatório vazio exportado com sucesso');
        toast.success("Relatório exportado com sucesso!");
        return;
      }

      logger.info('Exportando relatório com dados:', {
        registros: metrics.data.length,
        primeiroRegistro: metrics.data[0],
        ultimoRegistro: metrics.data[metrics.data.length - 1]
      });

      await exportToPDF(metrics, filters);
      toast.success("Relatório exportado com sucesso!");
    } catch (error) {
      logger.error('Erro ao exportar:', error, {
        stack: error.stack,
        metrics,
        filters
      });
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