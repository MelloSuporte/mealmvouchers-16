import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logger from '@/config/logger';

export const generatePDFComuns = (metrics, filters) => {
  try {
    // Log inicial para debug
    logger.info('Iniciando geração de PDF com dados:', {
      totalRegistros: metrics?.length || 0,
      primeiroRegistro: metrics?.[0],
      filtros: filters
    });

    if (!metrics || !Array.isArray(metrics)) {
      logger.error('Dados inválidos recebidos:', metrics);
      throw new Error('Dados inválidos para geração do PDF');
    }

    const doc = new jsPDF();
    let yPos = 20;

    // Cabeçalho
    doc.setFontSize(16);
    doc.text("Relatório de Vouchers Comuns", 14, yPos);
    yPos += 10;

    // Informações do relatório
    doc.setFontSize(10);
    if (filters?.startDate && filters?.endDate) {
      doc.text(`Período: ${format(new Date(filters.startDate), 'dd/MM/yyyy')} a ${format(new Date(filters.endDate), 'dd/MM/yyyy')}`, 14, yPos);
      yPos += 6;
    }

    if (filters?.company && filters.company !== 'all') {
      doc.text(`Empresa: ${filters.companyName || filters.company}`, 14, yPos);
      yPos += 6;
    }

    if (filters?.shift && filters.shift !== 'all') {
      doc.text(`Turno: ${filters.shiftName || filters.shift}`, 14, yPos);
      yPos += 6;
    }

    if (filters?.sector && filters.sector !== 'all') {
      doc.text(`Setor: ${filters.sectorName || filters.sector}`, 14, yPos);
      yPos += 6;
    }

    yPos += 10;

    // Verificar se há dados
    if (metrics.length === 0) {
      doc.setFontSize(12);
      doc.text("Nenhum registro encontrado para os filtros selecionados.", 14, yPos);
      doc.save('relatorio-vouchers-comuns.pdf');
      return doc;
    }

    // Preparar dados para a tabela
    const tableData = metrics.map(item => {
      try {
        return [
          item.data_uso ? format(new Date(item.data_uso), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : '-',
          item.nome_usuario || '-',
          item.tipo_refeicao || '-',
          new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor_refeicao || 0),
          item.turno || '-',
          item.nome_setor || '-',
          item.tipo_voucher || 'Comum'
        ];
      } catch (error) {
        logger.error('Erro ao processar item:', { item, error });
        return ['-', '-', '-', '-', '-', '-', '-'];
      }
    });

    // Configurar e gerar a tabela
    doc.autoTable({
      startY: yPos,
      head: [['Data/Hora', 'Usuário', 'Refeição', 'Valor', 'Turno', 'Setor', 'Tipo']],
      body: tableData,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [51, 51, 51],
        textColor: 255,
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 40 },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
        4: { cellWidth: 25 },
        5: { cellWidth: 25 },
        6: { cellWidth: 20 }
      }
    });

    // Adicionar totalizadores
    const finalY = doc.lastAutoTable.finalY || yPos;
    doc.setFontSize(10);
    doc.text(`Total de Registros: ${metrics.length}`, 14, finalY + 10);

    const totalValor = metrics.reduce((sum, item) => sum + (Number(item.valor_refeicao) || 0), 0);
    doc.text(
      `Valor Total: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValor)}`,
      14,
      finalY + 20
    );

    logger.info('PDF gerado com sucesso:', {
      totalRegistros: metrics.length,
      valorTotal: totalValor
    });

    doc.save('relatorio-vouchers-comuns.pdf');
    return doc;
  } catch (error) {
    logger.error('Erro ao gerar PDF:', error);
    throw error;
  }
};