import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { toast } from "sonner";

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value || 0);
};

const formatDate = (date) => {
  if (!date) return '-';
  return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: ptBR });
};

export const exportToPDF = async (metrics, filters) => {
  try {
    console.log('Iniciando exportação com dados:', { metrics, filters });

    if (!metrics?.data?.length) {
      toast.error("Não há dados para exportar");
      throw new Error("Não há dados para exportar");
    }

    const doc = new jsPDF();
    
    // Cabeçalho
    doc.setFontSize(16);
    doc.text("Relatório de Uso de Vouchers", 14, 15);
    
    doc.setFontSize(10);
    const startDate = filters.startDate ? formatDate(filters.startDate) : '-';
    const endDate = filters.endDate ? formatDate(filters.endDate) : '-';
    doc.text(`Período: ${startDate} a ${endDate}`, 14, 25);

    // Métricas resumidas
    doc.text("Resumo:", 14, 35);
    doc.text(`Total Gasto: ${formatCurrency(metrics.totalCost)}`, 14, 45);
    doc.text(`Custo Médio por Refeição: ${formatCurrency(metrics.averageCost)}`, 14, 55);
    doc.text(`Total de Refeições: ${metrics.data?.length || 0}`, 14, 65);

    // Dados detalhados em tabela
    const tableData = metrics.data.map(item => [
      formatDate(item.data_uso),
      item.nome_usuario || '-',
      item.cpf || '-',
      item.nome_empresa || '-',
      item.tipo_refeicao || '-',
      formatCurrency(item.valor_refeicao),
      item.turno || '-',
      item.nome_setor || '-'
    ]);

    doc.autoTable({
      startY: 75,
      head: [['Data/Hora', 'Usuário', 'CPF', 'Empresa', 'Refeição', 'Valor', 'Turno', 'Setor']],
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
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 35 },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
        4: { cellWidth: 20 },
        5: { cellWidth: 20 },
        6: { cellWidth: 20 },
        7: { cellWidth: 20 }
      }
    });

    const fileName = `relatorio-vouchers-${format(new Date(), 'dd-MM-yyyy-HH-mm', { locale: ptBR })}.pdf`;
    
    console.log('Salvando arquivo:', fileName);
    doc.save(fileName);
    
    toast.success("Relatório exportado com sucesso!");
    return fileName;
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    toast.error("Erro ao gerar PDF: " + error.message);
    throw error;
  }
};