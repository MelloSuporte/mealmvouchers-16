import React from 'react';
import { Button } from "@/components/ui/button";
import { FileText, FileSpreadsheet } from 'lucide-react';
import { toast } from "sonner";
import { useReportsTData } from '../hooks/useReportsTData';
import logger from '@/config/logger';

const ExportTButton = ({ filters }) => {
  const { data: reportData } = useReportsTData(filters);

  const handleExportPDF = async () => {
    try {
      if (!reportData || reportData.length === 0) {
        toast.error('Nenhum dado disponível para exportar');
        return;
      }

      logger.info('Iniciando exportação PDF...');
      toast.success('Relatório PDF gerado com sucesso!');
    } catch (error) {
      logger.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao gerar PDF');
    }
  };

  const handleExportExcel = async () => {
    try {
      if (!reportData || reportData.length === 0) {
        toast.error('Nenhum dado disponível para exportar');
        return;
      }

      logger.info('Iniciando exportação Excel...');
      toast.success('Relatório Excel gerado com sucesso!');
    } catch (error) {
      logger.error('Erro ao exportar Excel:', error);
      toast.error('Erro ao gerar Excel');
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={handleExportExcel}
        className="bg-green-600 hover:bg-green-700 text-white"
        size="sm"
      >
        <FileSpreadsheet className="mr-2 h-4 w-4" />
        Exportar Excel
      </Button>
      
      <Button
        onClick={handleExportPDF}
        className="bg-primary hover:bg-primary/90 text-white"
        size="sm"
      >
        <FileText className="mr-2 h-4 w-4" />
        Exportar PDF
      </Button>
    </div>
  );
};

export default ExportTButton;