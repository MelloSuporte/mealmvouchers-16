import React from 'react';
import { Button } from "@/components/ui/button";
import { FileDown } from 'lucide-react';
import { toast } from "sonner";
import { useUsageData } from '../hooks/useUsageData';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import logger from '@/config/logger';

const ExportButton = ({ metrics, filters }) => {
  const { data, isLoading } = useUsageData(filters);

  const formatCurrency = (value) => {
    if (!value || isNaN(value)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleExport = async () => {
    try {
      logger.info('Iniciando exportação do relatório', {
        filters,
        recordCount: data?.length || 0
      });

      const doc = new jsPDF();
      
      // Título
      doc.setFontSize(16);
      doc.text("Relatório de Uso de Vouchers", 14, 15);
      
      // Informações do usuário que exportou
      doc.setFontSize(10);
      const currentUser = "Sistema"; // TODO: Pegar nome do usuário logado
      const exportDate = format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
      doc.text(`Exportado por: ${currentUser} em ${exportDate}`, 14, 25);

      // Informações do Relatório
      logger.info('Adicionando informações do relatório ao PDF');
      doc.setFontSize(12);
      doc.text("Informações do Relatório:", 14, 35);

      // Empresa
      const empresaNome = filters.company === 'all' ? 'Todas as Empresas' : data?.[0]?.company || 'Empresa não especificada';
      doc.text(`Empresa: ${empresaNome}`, 14, 45);

      // Período
      const startDate = filters.startDate ? format(new Date(filters.startDate), 'dd/MM/yyyy', { locale: ptBR }) : '-';
      const endDate = filters.endDate ? format(new Date(filters.endDate), 'dd/MM/yyyy', { locale: ptBR }) : '-';
      doc.text(`Período: ${startDate} a ${endDate}`, 14, 55);

      // Valor Total
      const totalValue = metrics?.totalCost || 0;
      doc.text(`Valor Total: ${formatCurrency(totalValue)}`, 14, 65);

      // Mensagem quando não há dados
      if (!data || data.length === 0) {
        logger.warn('Nenhum dado encontrado para exportação');
        doc.text("Nenhum registro encontrado para o período selecionado.", 14, 85);
      } else {
        logger.info('Gerando tabela do relatório');
        
        // Tabela de Vouchers Usados
        doc.setFontSize(14);
        doc.text("Vouchers Utilizados", 14, 85);
        
        const tableData = data.map(item => [
          format(new Date(item.date), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
          item.userName || '-',
          item.company || '-',
          item.mealType || '-',
          formatCurrency(item.cost || 0)
        ]);

        logger.info(`Processados ${tableData.length} registros para a tabela`);

        doc.autoTable({
          startY: 95,
          head: [['Data/Hora', 'Usuário', 'Empresa', 'Refeição', 'Valor']],
          body: tableData,
          theme: 'grid',
          styles: { 
            fontSize: 8,
            cellPadding: 2
          },
          headStyles: { 
            fillColor: [66, 66, 66],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
          }
        });
      }

      const fileName = `relatorio-vouchers-${format(new Date(), 'dd-MM-yyyy-HH-mm', { locale: ptBR })}.pdf`;
      doc.save(fileName);
      
      logger.info('Relatório exportado com sucesso', { fileName });
      toast.success("Relatório exportado com sucesso!");
    } catch (error) {
      logger.error('Erro ao exportar relatório:', {
        error: error.message,
        stack: error.stack,
        filters: filters
      });
      toast.error("Erro ao exportar relatório: " + error.message);
    }
  };

  return (
    <Button 
      onClick={handleExport}
      disabled={isLoading}
      className="bg-primary hover:bg-primary/90 text-white"
      size="sm"
    >
      <FileDown className="mr-2 h-4 w-4" />
      Exportar Relatório
    </Button>
  );
};

export default ExportButton;