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
    doc.text("Relatório de Vouchers Descartáveis", 14, yPos);
    yPos += 10;

    // Informações do relatório
    doc.setFontSize(10);
    const adminName = localStorage.getItem('adminName') || 'Administrador';
    doc.text(`Relatório gerado por ${adminName}`, 14, yPos);
    yPos += 6;

    const dataExportacao = format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    doc.text(`Relatório gerado em ${dataExportacao}`, 14, yPos);
    yPos += 10;

    // Período do relatório
    if (filters?.startDate && filters?.endDate) {
      const periodo = `Período: ${format(new Date(filters.startDate), 'dd/MM/yyyy', { locale: ptBR })} a ${format(new Date(filters.endDate), 'dd/MM/yyyy', { locale: ptBR })}`;
      doc.text(periodo, 14, yPos);
      yPos += 10;
    }

    // Totalizadores
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

    // Preparar dados para a tabela usando as mesmas colunas do Excel
    const tableData = metrics.map(item => [
      item.codigo || '-',
      item.nome_pessoa || '-',
      item.nome_empresa || '-',
      item.tipos_refeicao?.nome || '-',
      item.data_requisicao ? format(new Date(item.data_requisicao), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : '-',
      item.data_uso ? format(new Date(item.data_uso), 'dd/MM/yyyy', { locale: ptBR }) : '-',
      formatCurrency(item.tipos_refeicao?.valor || 0),
      item.admin_users?.nome || '-'
    ]);

    // Configurar e gerar a tabela
    doc.autoTable({
      startY: yPos + 10,
      head: [['Código', 'Nome', 'Empresa', 'Refeição', 'Data Requisição', 'Data Uso', 'Valor', 'Solicitante']],
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
        0: { cellWidth: 20 },
        1: { cellWidth: 30 },
        2: { cellWidth: 30 },
        3: { cellWidth: 25 },
        4: { cellWidth: 25 },
        5: { cellWidth: 25 },
        6: { cellWidth: 20 },
        7: { cellWidth: 25 }
      }
    });

    return doc;
  } catch (error) {
    logger.error('Erro ao gerar PDF:', error);
    throw error;
  }
};