import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logger from '@/config/logger';

export const generatePDFComuns = (metrics, filters) => {
  try {
    logger.info('Gerando PDF de vouchers comuns:', { 
      totalRegistros: metrics?.length,
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
    if (filters?.startDate && filters?.endDate) {
      doc.text(`Período: ${format(new Date(filters.startDate), 'dd/MM/yyyy')} a ${format(new Date(filters.endDate), 'dd/MM/yyyy')}`, 14, yPos);
      yPos += 6;
    }

    if (filters?.company) {
      doc.text(`Empresa: ${filters.companyName || filters.company}`, 14, yPos);
      yPos += 6;
    }

    if (filters?.shift) {
      doc.text(`Turno: ${filters.shiftName || filters.shift}`, 14, yPos);
      yPos += 6;
    }

    if (filters?.sector) {
      doc.text(`Setor: ${filters.sectorName || filters.sector}`, 14, yPos);
      yPos += 6;
    }

    yPos += 10;

    // Verificar se há dados para processar
    if (!metrics || metrics.length === 0) {
      doc.setFontSize(12);
      doc.text("Nenhum registro encontrado para os filtros selecionados.", 14, yPos);
      doc.save('relatorio-vouchers-comuns.pdf');
      return;
    }

    // Preparar dados para a tabela
    const tableData = metrics.map(item => {
      const dataUso = item.usado_em ? format(new Date(item.usado_em), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : '-';
      const nomeUsuario = item.nome_pessoa || '-';
      const codigo = item.codigo || '-';
      const turno = item.turno || '-';
      const setor = item.setor || '-';
      const tipoRefeicao = item.tipos_refeicao?.nome || '-';
      const valor = item.tipos_refeicao?.valor 
        ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.tipos_refeicao.valor)
        : 'R$ 0,00';

      return [
        dataUso,
        codigo,
        nomeUsuario,
        turno,
        setor,
        tipoRefeicao,
        valor
      ];
    });

    // Configurar e gerar a tabela
    doc.autoTable({
      startY: yPos,
      head: [['Data/Hora', 'Código', 'Nome', 'Turno', 'Setor', 'Refeição', 'Valor']],
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
        1: { cellWidth: 20 }, // Código
        2: { cellWidth: 45 }, // Nome
        3: { cellWidth: 25 }, // Turno
        4: { cellWidth: 25 }, // Setor
        5: { cellWidth: 25 }, // Refeição
        6: { cellWidth: 20 }  // Valor
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

    // Adicionar totalizadores
    const finalY = doc.lastAutoTable.finalY || yPos;
    doc.setFontSize(10);
    doc.text(`Total de Registros: ${metrics.length}`, 14, finalY + 10);

    const totalValor = metrics.reduce((sum, item) => sum + (item.tipos_refeicao?.valor || 0), 0);
    doc.text(
      `Valor Total: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValor)}`,
      14,
      finalY + 20
    );

    doc.save('relatorio-vouchers-comuns.pdf');
    return doc;
  } catch (error) {
    logger.error('Erro ao gerar PDF de vouchers comuns:', error);
    throw error;
  }
};