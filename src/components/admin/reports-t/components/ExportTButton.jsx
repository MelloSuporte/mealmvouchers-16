import React from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useReportsTData } from '../hooks/useReportsTData';
import logger from '@/config/logger';
import { exportToExcel } from '../utils/excelExporter';
import { exportToPDF } from '../utils/pdfExporter';
import * as XLSX from 'xlsx';
import { useAdmin } from '@/contexts/AdminContext';

const ExportTButton = ({ filters }) => {
  const { data: reportData } = useReportsTData(filters);
  const { adminUser } = useAdmin();

  const handlePDFExport = async () => {
    try {
      if (!reportData) {
        toast.error('Nenhum dado disponível para exportar');
        return;
      }

      logger.info('Iniciando exportação PDF...');
      const doc = await exportToPDF(reportData, filters, adminUser?.nome);
      doc.save(`relatorio_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('Relatório PDF gerado com sucesso!');
    } catch (error) {
      logger.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao gerar PDF');
    }
  };

  const handleExcelExport = async () => {
    try {
      if (!reportData) {
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
      <Button onClick={handlePDFExport} variant="outline" size="sm">
        Exportar PDF
      </Button>
      <Button onClick={handleExcelExport} variant="outline" size="sm">
        Exportar Excel
      </Button>
    </div>
  );
};

export default ExportTButton;