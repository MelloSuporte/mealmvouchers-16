import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logger from '@/config/logger';

export const generatePDFComuns = (metrics, filters) => {
  try {
    logger.info('Gerando PDF de vouchers comuns:', { 
      totalRegistros: metrics?.data?.length,
      filtros: filters 
    });

    const doc = new jsPDF();
    let yPos = 20;

    // Cabeçalho
    doc.setFontSize(16);
    doc.text("Relatório de Vouchers Comuns", 14, yPos);
    yPos += 10;

    // Filtros aplicados
    doc.setFontSize(10);
    if (filters?.startDate) {
      doc.text(`Período: ${format(new Date(filters.startDate), 'dd/MM/yyyy')} a ${format(new Date(filters.endDate), 'dd/MM/yyyy')}`, 14, yPos);
      yPos += 6;
    }
    if (filters?.company) {
      doc.text(`Empresa: ${filters.company}`, 14, yPos);
      yPos += 6;
    }
    if (filters?.shift) {
      doc.text(`Turno: ${filters.shift}`, 14, yPos);
      yPos += 6;
    }
    if (filters?.sector) {
      doc.text(`Setor: ${filters.sector}`, 14, yPos);
      yPos += 6;
    }

    yPos += 10;

    const formatDate = (date) => {
      if (!date) return '-';
      return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: ptBR });
    };

    const formatCurrency = (value) => {
      if (!value && value !== 0) return 'R$ 0,00';
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    };

    // Tabela de Vouchers
    doc.setFontSize(14);
    doc.text("Vouchers Utilizados", 14, yPos);
    yPos += 10;

    // Preparar dados para a tabela
    const tableData = metrics.data.map(item => [
      formatDate(item.data_uso),
      item.nome_usuario || '-',
      item.turno || '-',
      item.nome_setor || '-',
      item.tipo_refeicao || '-',
      formatCurrency(item.valor || 0)
    ]);

    // Configurar e gerar a tabela
    doc.autoTable({
      startY: yPos,
      head: [['Data Consumo', 'Nome', 'Turno', 'Setor', 'Refeição', 'Valor']],
      body: tableData,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak',
        cellWidth: 'wrap'
      },
      columnStyles: {
        0: { cellWidth: 35 }, // Data
        1: { cellWidth: 50 }, // Nome
        2: { cellWidth: 25 }, // Turno
        3: { cellWidth: 30 }, // Setor
        4: { cellWidth: 25 }, // Refeição
        5: { cellWidth: 25 }  // Valor
      },
      headStyles: {
        fillColor: [51, 51, 51],
        textColor: 255,
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'center'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    });

    return doc;
  } catch (error) {
    logger.error('Erro ao gerar PDF de vouchers comuns:', error);
    throw error;
  }
};