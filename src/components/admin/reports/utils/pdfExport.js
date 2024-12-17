import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { toast } from "sonner";

export const exportToPDF = async (metrics, filters) => {
  try {
    console.log('Iniciando exportação com dados:', { metrics, filters });

    if (!metrics?.data?.length) {
      toast.error("Não há dados para exportar");
      throw new Error("Não há dados para exportar");
    }

    const doc = new jsPDF();
    
    // Configuração do cabeçalho
    doc.setFontSize(16);
    doc.text("Relatório de Uso de Vouchers", 14, 15);
    
    doc.setFontSize(10);
    const startDate = filters.startDate ? format(new Date(filters.startDate), 'dd/MM/yyyy', { locale: ptBR }) : '-';
    const endDate = filters.endDate ? format(new Date(filters.endDate), 'dd/MM/yyyy', { locale: ptBR }) : '-';
    doc.text(`Período: ${startDate} a ${endDate}`, 14, 25);

    // Métricas resumidas
    doc.text("Resumo:", 14, 35);
    doc.text(`Total Gasto: R$ ${metrics.totalCost?.toFixed(2) || '0,00'}`, 14, 45);
    doc.text(`Custo Médio por Refeição: R$ ${metrics.averageCost?.toFixed(2) || '0,00'}`, 14, 55);
    doc.text(`Total de Refeições: ${metrics.data?.length || 0}`, 14, 65);

    // Dados detalhados em tabela
    const tableData = metrics.data.map(item => [
      format(new Date(item.data_uso), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
      item.nome_usuario || '-',
      item.cpf || '-',
      item.empresa || '-',
      item.tipo_refeicao || '-',
      `R$ ${parseFloat(item.valor || 0).toFixed(2)}`,
      item.turno || '-'
    ]);

    doc.autoTable({
      startY: 75,
      head: [['Data/Hora', 'Usuário', 'CPF', 'Empresa', 'Refeição', 'Valor', 'Turno']],
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
        0: { cellWidth: 30 }, // Data/Hora
        1: { cellWidth: 40 }, // Usuário
        2: { cellWidth: 25 }, // CPF
        3: { cellWidth: 30 }, // Empresa
        4: { cellWidth: 25 }, // Refeição
        5: { cellWidth: 20 }, // Valor
        6: { cellWidth: 20 }  // Turno
      }
    });

    // Nome do arquivo com data atual
    const fileName = `relatorio-vouchers-${format(new Date(), 'dd-MM-yyyy-HH-mm', { locale: ptBR })}.pdf`;
    
    console.log('Salvando arquivo:', fileName);
    doc.save(fileName);
    
    return fileName;
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    toast.error("Erro ao gerar PDF: " + error.message);
    throw error;
  }
};