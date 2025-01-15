import React from 'react';
import { Button } from "@/components/ui/button";
import { FileText, FileSpreadsheet } from 'lucide-react';
import { toast } from "sonner";
import { useReportsTData } from '../hooks/useReportsTData';
import logger from '@/config/logger';
import { useAdmin } from '@/contexts/AdminContext';
import * as XLSX from 'xlsx';
import { exportToPDF } from '../utils/pdfExporter';
import { exportToExcel } from '../utils/excelExporter';
import { getFileName } from '../utils/formatters';

const ExportTButton = ({ filters }) => {
  const { data, isLoading } = useReportsTData(filters);
  const { adminName } = useAdmin();

  const handleExportExcel = async () => {
    try {
      logger.info('Iniciando exportação do relatório Excel', {
        filters,
        recordCount: data?.length || 0
      });

      const { wb, ws } = exportToExcel(data);
      XLSX.utils.book_append_sheet(wb, ws, "Relatório");

      const fileName = `${getFileName()}.xlsx`;
      XLSX.writeFile(wb, fileName);

      logger.info('Relatório Excel exportado com sucesso', { fileName });
      toast.success("Relatório Excel exportado com sucesso!");
    } catch (error) {
      logger.error('Erro ao exportar relatório Excel:', {
        error: error.message,
        stack: error.stack,
        filters: filters
      });
      toast.error("Erro ao exportar relatório Excel: " + error.message);
    }
  };

  const handleExportPDF = async () => {
    try {
      logger.info('Iniciando exportação do relatório PDF', {
        filters,
        recordCount: data?.length || 0
      });

      const doc = await exportToPDF(data, filters, adminName);
      const fileName = `${getFileName()}.pdf`;
      doc.save(fileName);
      
      logger.info('Relatório PDF exportado com sucesso', { fileName });
      toast.success("Relatório PDF exportado com sucesso!");
    } catch (error) {
      logger.error('Erro ao exportar relatório PDF:', {
        error: error.message,
        stack: error.stack,
        filters: filters
      });
      toast.error("Erro ao exportar relatório PDF: " + error.message);
    }
  };

  return (
    <div className="flex gap-2">
      <Button 
        onClick={handleExportPDF}
        disabled={isLoading}
        className="bg-primary hover:bg-primary/90 text-white"
        size="sm"
      >
        <FileText className="mr-2 h-4 w-4" />
        Exportar PDF
      </Button>
      
      <Button 
        onClick={handleExportExcel}
        disabled={isLoading}
        className="bg-green-600 hover:bg-green-700 text-white"
        size="sm"
      >
        <FileSpreadsheet className="mr-2 h-4 w-4" />
        Exportar Excel
      </Button>
    </div>
  );
};

export default ExportTButton;