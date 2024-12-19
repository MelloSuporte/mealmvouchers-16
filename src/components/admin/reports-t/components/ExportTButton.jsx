import React from 'react';
import { Button } from "@/components/ui/button";
import { FileDown } from 'lucide-react';
import { toast } from "sonner";
import { useReportsTData } from '../hooks/useReportsTData';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ExportTButton = ({ filters }) => {
  const { data, isLoading } = useReportsTData(filters);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleExport = async () => {
    try {
      if (!data?.length) {
        toast.error("Não há dados para exportar");
        return;
      }

      const doc = new jsPDF();
      
      // Cabeçalho
      doc.setFontSize(16);
      doc.text("Relatório de Uso de Vouchers", 14, 15);
      
      doc.setFontSize(10);
      const startDate = filters.startDate ? format(filters.startDate, 'dd/MM/yyyy', { locale: ptBR }) : '-';
      const endDate = filters.endDate ? format(filters.endDate, 'dd/MM/yyyy', { locale: ptBR }) : '-';
      doc.text(`Período: ${startDate} a ${endDate}`, 14, 25);

      // Filtros aplicados
      doc.text("Filtros aplicados:", 14, 35);
      doc.text(`Empresa: ${filters.company === 'all' ? 'Todas' : data[0]?.nome_empresa || '-'}`, 14, 45);
      doc.text(`Turno: ${filters.shift === 'all' ? 'Todos' : filters.shift}`, 14, 55);
      doc.text(`Setor: ${filters.sector === 'all' ? 'Todos' : filters.sector}`, 14, 65);
      doc.text(`Tipo de Refeição: ${filters.mealType === 'all' ? 'Todos' : filters.mealType}`, 14, 75);

      // Valor total
      const totalValue = data.reduce((sum, item) => sum + (parseFloat(item.valor_refeicao) || 0), 0);
      doc.text(`Valor Total: ${formatCurrency(totalValue)}`, 14, 85);

      // Dados detalhados
      const tableData = data.map(item => [
        format(new Date(item.data_uso), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
        item.nome_usuario || '-',
        item.tipo_refeicao || '-',
        formatCurrency(item.valor_refeicao || 0)
      ]);

      doc.autoTable({
        startY: 95,
        head: [['Data/Hora', 'Usuário', 'Refeição', 'Valor']],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 8 }
      });

      const fileName = `relatorio-vouchers-${format(new Date(), 'dd-MM-yyyy-HH-mm', { locale: ptBR })}.pdf`;
      doc.save(fileName);
      
      toast.success("Relatório exportado com sucesso!");
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast.error("Erro ao exportar relatório");
    }
  };

  return (
    <Button 
      onClick={handleExport}
      disabled={isLoading || !data?.length}
    >
      <FileDown className="mr-2 h-4 w-4" />
      Exportar Relatório
    </Button>
  );
};

export default ExportTButton;