import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logger from '@/config/logger';
import { formatCurrency, formatDate } from './formatters';

export const exportToPDF = async (metrics, filters) => {
  try {
    logger.info('Iniciando geração do PDF:', { metrics, filters });

    const doc = new jsPDF();
    let yPos = 20;
    
    // Título
    doc.setFontSize(16);
    doc.text("Relatório de Uso de Vouchers", 14, yPos);
    yPos += 10;
    
    // Informações do usuário que exportou
    const adminName = localStorage.getItem('adminName') || 'Usuário não identificado';
    doc.setFontSize(8);
    const dataExportacao = format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    doc.text(`Relatório gerado por ${adminName} em ${dataExportacao}`, 14, yPos);
    yPos += 10;
    
    // Seção de Filtros Aplicados
    doc.setFontSize(12);
    doc.text("Filtros Aplicados:", 14, yPos);
    yPos += 8;

    doc.setFontSize(10);
    
    // Período
    if (filters.startDate && filters.endDate) {
      const startDate = formatDate(filters.startDate);
      const endDate = formatDate(filters.endDate);
      doc.text(`Período: ${startDate} a ${endDate}`, 14, yPos);
      yPos += 6;
    }

    // Empresa (quando filtrada)
    if (filters.company && filters.company !== 'all') {
      doc.text(`Empresa: ${filters.companyName || filters.company}`, 14, yPos);
      yPos += 6;
    }

    // Setor (quando filtrado)
    if (filters.sector && filters.sector !== 'all') {
      doc.text(`Setor: ${filters.sectorName || filters.sector}`, 14, yPos);
      yPos += 6;
    }

    // Turno (quando filtrado)
    if (filters.shift && filters.shift !== 'all') {
      doc.text(`Turno: ${filters.shiftName || filters.shift}`, 14, yPos);
      yPos += 6;
    }

    // Tipo de Refeição (quando filtrado)
    if (filters.mealType && filters.mealType !== 'all') {
      doc.text(`Tipo de Refeição: ${filters.mealTypeName || filters.mealType}`, 14, yPos);
      yPos += 6;
    }

    // Totais
    const totalRegistros = metrics?.data?.length || 0;
    const valorTotal = metrics?.data?.reduce((sum, item) => sum + (Number(item.valor_refeicao) || 0), 0) || 0;

    doc.text(`Total de Registros: ${totalRegistros}`, 14, yPos);
    yPos += 6;
    doc.text(`Valor Total: ${formatCurrency(valorTotal)}`, 14, yPos);
    yPos += 10;

    if (!metrics?.data || metrics.data.length === 0) {
      doc.text("Nenhum registro encontrado para o período selecionado.", 14, yPos);
      doc.save('relatorio-vouchers.pdf');
      return;
    }

    // Tabela de dados
    const tableData = metrics.data.map(item => [
      formatDate(item.data_uso),
      item.nome_usuario || '-',
      item.codigo || '-',
      item.tipo_refeicao || '-',
      formatCurrency(item.valor_refeicao || 0),
      item.turno || '-',
      item.nome_setor || '-'
    ]);

    doc.autoTable({
      startY: yPos,
      head: [['Data/Hora', 'Nome', 'Código', 'Refeição', 'Valor', 'Turno', 'Setor']],
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
        2: { cellWidth: 20 },
        3: { cellWidth: 25 },
        4: { cellWidth: 20 },
        5: { cellWidth: 20 },
        6: { cellWidth: 25 }
      }
    });

    logger.info('PDF gerado com sucesso:', {
      totalRegistros,
      valorTotal
    });

    doc.save('relatorio-vouchers.pdf');
    return doc;
  } catch (error) {
    logger.error('Erro ao gerar PDF:', error);
    throw error;
  }
};