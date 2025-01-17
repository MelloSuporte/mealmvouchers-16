import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logger from '@/config/logger';
import { formatCurrency, formatDate } from './formatters';

export const exportToPDF = async (metrics, filters) => {
  try {
    logger.info('Iniciando exportação PDF...');
    
    const doc = new jsPDF();
    let yPos = 15;
    
    // Título
    doc.setFontSize(16);
    doc.text("Relatório de Uso de Vouchers", 14, yPos);
    yPos += 10;
    
    // Data de exportação
    doc.setFontSize(8);
    const dataExportacao = format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    doc.text(`Exportado em ${dataExportacao}`, 14, yPos);
    yPos += 15;
    
    // Período do relatório
    doc.setFontSize(10);
    const startDate = filters?.startDate ? formatDate(filters.startDate) : '-';
    const endDate = filters?.endDate ? formatDate(filters.endDate) : '-';
    doc.text(`Período: ${startDate} a ${endDate}`, 14, yPos);
    yPos += 10;

    // Valor Total
    const valorTotal = formatCurrency(metrics?.totalCost || 0);
    doc.text(`Valor Total: ${valorTotal}`, 14, yPos);
    yPos += 15;

    if (!metrics?.data || metrics.data.length === 0) {
      doc.text("Nenhum registro encontrado para o período selecionado.", 14, yPos);
      doc.save('relatorio-vouchers-comuns.pdf');
      return doc;
    }

    // Informações de Consumo
    doc.setFontSize(14);
    doc.text("Informações de Consumo", 14, yPos);
    yPos += 10;

    // Preparar dados para a tabela
    const tableData = metrics.data.map(item => [
      formatDate(item.data_uso),
      item.nome_usuario || '-',
      item.turno || '-',
      item.nome_setor || '-',
      item.tipo_refeicao || '-',
      formatCurrency(item.valor_refeicao || 0)
    ]);

    // Configurar e gerar a tabela
    doc.autoTable({
      startY: yPos,
      head: [['Data de Consumo', 'Nome', 'Turno', 'Setor', 'Refeição', 'Valor']],
      body: tableData,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2,
        halign: 'left'
      },
      headStyles: {
        fillColor: [66, 66, 66],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'left'
      },
      columnStyles: {
        0: { cellWidth: 30 }, // Data de Consumo
        1: { cellWidth: 50 }, // Nome
        2: { cellWidth: 20 }, // Turno
        3: { cellWidth: 35 }, // Setor
        4: { cellWidth: 35 }, // Refeição
        5: { cellWidth: 20, halign: 'right' }  // Valor
      },
      didDrawCell: (data) => {
        // Ajusta o alinhamento do valor para a direita apenas na coluna de valor
        if (data.column.index === 5 && data.cell.section === 'body') {
          const cell = data.cell;
          cell.styles.halign = 'right';
        }
      }
    });

    // Salvar o PDF
    doc.save('relatorio-vouchers-comuns.pdf');
    return doc;
  } catch (error) {
    logger.error('Erro ao gerar PDF:', error);
    throw error;
  }
};