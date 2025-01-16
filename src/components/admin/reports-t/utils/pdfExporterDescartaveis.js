import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logger from '@/config/logger';
import { formatCurrency, formatDate } from './formatters';

export const exportToPDF = async (metrics, filters) => {
  try {
    logger.info('Iniciando exportação PDF de vouchers descartáveis...');

    const doc = new jsPDF();
    let yPos = 15; // Posição inicial Y
    
    // Título
    doc.setFontSize(16);
    doc.text("Relatório de Vouchers Descartáveis", 14, yPos);
    yPos += 10;
    
    // Data de exportação
    doc.setFontSize(8);
    const dataExportacao = format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    doc.text(`Exportado em ${dataExportacao}`, 14, yPos);
    yPos += 15;
    
    // Cabeçalho do relatório
    doc.setFontSize(10);
    doc.text("Informações do Relatório:", 14, yPos);
    yPos += 10;
    
    // Período
    const startDate = filters?.startDate ? formatDate(filters.startDate) : '-';
    const endDate = filters?.endDate ? formatDate(filters.endDate) : '-';
    doc.text(`Período: ${startDate} a ${endDate}`, 14, yPos);
    yPos += 10;

    // Filtros Aplicados
    doc.text("Filtros Aplicados:", 14, yPos);
    yPos += 8;

    let filtrosAplicados = false;

    // Empresa
    if (filters?.company && filters.company !== 'all') {
      doc.text(`• Empresa: ${filters.companyName || filters.company}`, 20, yPos);
      yPos += 8;
      filtrosAplicados = true;
    }

    // Tipo de Refeição
    if (filters?.mealType && filters.mealType !== 'all') {
      doc.text(`• Tipo de Refeição: ${filters.mealTypeName || filters.mealType}`, 20, yPos);
      yPos += 8;
      filtrosAplicados = true;
    }

    if (!filtrosAplicados) {
      doc.text(`• Nenhum filtro aplicado`, 20, yPos);
      yPos += 8;
    }

    yPos += 8;

    // Valor Total
    const valorTotal = formatCurrency(metrics?.totalCost || 0);
    doc.text(`Valor Total: ${valorTotal}`, 14, yPos);
    yPos += 15;

    if (!metrics?.data || metrics.data.length === 0) {
      doc.text("Nenhum registro encontrado para o período selecionado.", 14, yPos);
      doc.save('relatorio-vouchers-descartaveis.pdf');
      return doc;
    }

    // Tabela de Vouchers
    doc.setFontSize(14);
    doc.text("Vouchers Descartáveis Utilizados", 14, yPos);
    yPos += 10;

    const tableData = metrics.data.map(item => [
      formatDate(item.usado_em),
      item.nome_pessoa || '-',
      item.tipos_refeicao?.nome || '-',
      formatCurrency(item.tipos_refeicao?.valor || 0),
      item.codigo || '-',
      item.nome_empresa || '-'
    ]);

    doc.autoTable({
      startY: yPos,
      head: [['Data/Hora', 'Pessoa', 'Refeição', 'Valor', 'Código', 'Empresa']],
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
        3: { cellWidth: 20 },
        4: { cellWidth: 20 },
        5: { cellWidth: 30 }
      }
    });

    doc.save('relatorio-vouchers-descartaveis.pdf');
    return doc;
  } catch (error) {
    logger.error('Erro ao gerar PDF:', error);
    throw error;
  }
};