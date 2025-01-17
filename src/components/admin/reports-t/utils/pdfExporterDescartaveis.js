import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logger from '@/config/logger';
import { formatCurrency, formatDate } from './formatters';

export const exportToPDF = async (metrics, filters) => {
  try {
    logger.info('Iniciando exportação PDF de vouchers descartáveis...');

    const adminName = localStorage.getItem('adminName') || 'Administrador';
    const doc = new jsPDF();
    let yPos = 15; // Posição inicial Y
    
    // Título
    doc.setFontSize(16);
    doc.text("Relatório Consumo de Refeições", 14, yPos);
    yPos += 10;
    
    // Informações do relatório
    doc.setFontSize(8);
    doc.text(`Relatório gerado por: ${adminName}`, 14, yPos);
    yPos += 5;
    
    const dataExportacao = format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    doc.text(`Data de exportação: ${dataExportacao}`, 14, yPos);
    yPos += 10;

    // Tipo de Voucher
    doc.text("Tipo de Voucher: Descartável", 14, yPos);
    yPos += 10;

    // Período
    const startDate = filters?.startDate ? formatDate(filters.startDate) : '-';
    const endDate = filters?.endDate ? formatDate(filters.endDate) : '-';
    doc.text(`Período: ${startDate} a ${endDate}`, 14, yPos);
    yPos += 10;

    // Totalizadores
    doc.text("Totalizadores:", 14, yPos);
    yPos += 5;
    
    const totalRegistros = metrics?.data?.length || 0;
    doc.text(`Total de Registros: ${totalRegistros}`, 14, yPos);
    yPos += 5;

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
      formatDate(item.data_uso),
      item.nome_pessoa || '-',
      item.nome_empresa || '-',
      item.tipos_refeicao?.nome || '-',
      formatCurrency(item.tipos_refeicao?.valor || 0)
    ]);

    doc.autoTable({
      startY: yPos,
      head: [['Data/Hora', 'Nome', 'Empresa', 'Refeição', 'Valor']],
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
        1: { cellWidth: 40 }, // Nome
        2: { cellWidth: 40 }, // Empresa
        3: { cellWidth: 40 }, // Refeição
        4: { cellWidth: 25 }  // Valor
      }
    });

    doc.save('relatorio-vouchers-descartaveis.pdf');
    return doc;
  } catch (error) {
    logger.error('Erro ao gerar PDF:', error);
    throw error;
  }
};