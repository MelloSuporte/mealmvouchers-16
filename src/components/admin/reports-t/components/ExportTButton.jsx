import React from 'react';
import { Button } from "@/components/ui/button";
import { FileText, FileSpreadsheet } from 'lucide-react';
import { toast } from "sonner";
import { useReportsTData } from '../hooks/useReportsTData';
import logger from '@/config/logger';
import { exportToExcel } from '../utils/excelExporter';
import { exportToPDF } from '../utils/pdfExporter';
import * as XLSX from 'xlsx';

const ExportTButton = ({ filters }) => {
  const { data: reportData } = useReportsTData(filters);

  const handleExportPDF = async () => {
    try {
      if (!reportData || reportData.length === 0) {
        toast.error('Nenhum dado disponível para exportar');
        return;
      }

      logger.info('Iniciando exportação PDF...');
      const doc = await exportToPDF(reportData, filters);
      doc.save(`relatorio_${new Date().toISOString().split('T')[0]}.pdf`);
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
      const { wb, ws } = exportToExcel(reportData);
      XLSX.utils.book_append_sheet(wb, ws, "Relatório");
      XLSX.writeFile(wb, `relatorio_${new Date().toISOString().split('T')[0]}.xlsx`);
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