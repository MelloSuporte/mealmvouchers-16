import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logger from '@/config/logger';

export const exportToPDF = async (metrics, filters) => {
  try {
    logger.info('Iniciando geração do PDF de vouchers comuns:', { metrics, filters });
    
    if (!metrics || !Array.isArray(metrics.data)) {
      logger.error('Dados inválidos recebidos:', metrics);
      throw new Error('Dados inválidos para geração do PDF');
    }

    const doc = new jsPDF();
    let yPos = 20;

    // Título do relatório
    doc.setFontSize(16);
    doc.text("Relatório de Vouchers Comuns", 14, yPos);
    yPos += 10;

    // Informações do administrador e data/hora
    doc.setFontSize(10);
    const adminName = localStorage.getItem('adminName') || 'Usuário não identificado';
    const dataExportacao = format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    doc.text(`Relatório gerado por ${adminName}`, 14, yPos);
    yPos += 6;
    doc.text(`Data de exportação: ${dataExportacao}`, 14, yPos);
    yPos += 10;

    // Totalizadores no topo
    const totalRegistros = metrics.data.length;
    const valorTotal = metrics.data.reduce((sum, item) => sum + (Number(item.valor_refeicao) || 0), 0);
    
    doc.setFontSize(12);
    doc.text("Totalizadores:", 14, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.text(`Total de Registros: ${totalRegistros}`, 14, yPos);
    yPos += 6;
    doc.text(`Valor Total: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorTotal)}`, 14, yPos);
    yPos += 10;

    // Seção de Filtros Aplicados
    doc.setFontSize(12);
    doc.text("Filtros Aplicados:", 14, yPos);
    yPos += 8;

    doc.setFontSize(10);
    
    // Período
    if (filters?.startDate && filters?.endDate) {
      doc.text(`Período: ${format(new Date(filters.startDate), 'dd/MM/yyyy')} a ${format(new Date(filters.endDate), 'dd/MM/yyyy')}`, 14, yPos);
      yPos += 6;
    }

    // Empresa
    if (filters?.company && filters.company !== 'all') {
      doc.text(`Empresa: ${filters.companyName || filters.company}`, 14, yPos);
      yPos += 6;
    }

    // Setor
    if (filters?.sector && filters.sector !== 'all') {
      doc.text(`Setor: ${filters.sectorName || filters.sector}`, 14, yPos);
      yPos += 6;
    }

    // Turno
    if (filters?.shift && filters.shift !== 'all') {
      doc.text(`Turno: ${filters.shiftName || filters.shift}`, 14, yPos);
      yPos += 6;
    }

    // Tipo de Refeição
    if (filters?.mealType && filters.mealType !== 'all') {
      doc.text(`Tipo de Refeição: ${filters.mealTypeName || filters.mealType}`, 14, yPos);
      yPos += 6;
    }

    yPos += 10;

    // Verificar se há dados
    if (!metrics.data || metrics.data.length === 0) {
      doc.setFontSize(12);
      doc.text("Nenhum registro encontrado para os filtros selecionados.", 14, yPos);
      doc.save('relatorio-vouchers-comuns.pdf');
      return doc;
    }

    // Tabela de dados
    const tableData = metrics.data.map(item => [
      format(new Date(item.data_uso), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
      item.nome_usuario || '-',
      item.tipo_refeicao || '-',
      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor_refeicao || 0),
      item.turno || '-',
      item.nome_setor || '-',
      'Comum'
    ]);

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
        5: { cellWidth: 20 },
        6: { cellWidth: 20 }
      }
    });

    logger.info('PDF de vouchers comuns gerado com sucesso');
    doc.save('relatorio-vouchers-comuns.pdf');
    return doc;
  } catch (error) {
    logger.error('Erro ao gerar PDF:', error);
    throw error;
  }
};