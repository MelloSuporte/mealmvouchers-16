import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logger from '@/config/logger';
import { formatCurrency } from './formatters';

export const exportToPDFDescartaveis = async (metrics, filters) => {
  try {
    logger.info('Iniciando geração do PDF:', { metrics, filters });

    const doc = new jsPDF();
    let yPos = 20;

    // Cabeçalho
    doc.setFontSize(16);
    doc.text("Relatório Consumo de Refeições", 14, yPos);
    yPos += 10;

    // Informações do relatório
    doc.setFontSize(10);
    const adminName = localStorage.getItem('adminName') || 'Usuário não identificado';
    const dataExportacao = format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    doc.text(`Relatório gerado por: ${adminName}`, 14, yPos);
    yPos += 6;
    doc.text(`Data de exportação: ${dataExportacao}`, 14, yPos);
    yPos += 6;

    // Período
    if (filters?.startDate && filters?.endDate) {
      const periodo = `Período: ${format(new Date(filters.startDate), 'dd/MM/yyyy', { locale: ptBR })} a ${format(new Date(filters.endDate), 'dd/MM/yyyy', { locale: ptBR })}`;
      doc.text(periodo, 14, yPos);
      yPos += 6;
    }

    // Tipo de Voucher
    doc.text("Tipo de Voucher: Descartável", 14, yPos);
    yPos += 10;

    // Totalizadores
    doc.text("Totalizadores:", 14, yPos);
    yPos += 6;
    
    const totalRegistros = metrics?.length || 0;
    const valorTotal = metrics?.reduce((sum, item) => sum + (Number(item.tipos_refeicao?.valor) || 0), 0) || 0;
    
    doc.text(`Total de Registros: ${totalRegistros}`, 14, yPos);
    yPos += 6;
    doc.text(`Valor Total: ${formatCurrency(valorTotal)}`, 14, yPos);
    yPos += 10;

    // Verificar se há dados
    if (!metrics || metrics.length === 0) {
      doc.setFontSize(12);
      doc.text("Nenhum registro encontrado para os filtros selecionados.", 14, yPos);
      return doc;
    }

    // Preparar dados para a tabela
    const tableData = metrics.map(item => [
      item.tipos_refeicao?.nome || '-',
      item.nome_pessoa || '-',
      item.nome_empresa || '-',
      item.data_requisicao ? format(new Date(item.data_requisicao), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : '-',
      item.usado_em ? format(new Date(item.usado_em), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : '-',
      item.solicitante || '-'
    ]);

    // Configurar e gerar a tabela
    doc.autoTable({
      startY: yPos,
      head: [['Tipo Refeição', 'Nome', 'Empresa', 'Data Requisição', 'Data Uso', 'Solicitante']],
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
        0: { cellWidth: 25 },
        1: { cellWidth: 25 },
        2: { cellWidth: 25 },
        3: { cellWidth: 30 },
        4: { cellWidth: 30 },
        5: { cellWidth: 30 }
      }
    });

    return doc;
  } catch (error) {
    logger.error('Erro ao gerar PDF:', error);
    throw error;
  }
};