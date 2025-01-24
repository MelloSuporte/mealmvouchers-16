import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logger from '@/config/logger';
import { formatCurrency } from './formatters';

export const exportToPDF = async (metrics, filters) => {
  try {
    logger.info('Iniciando geração do PDF:', { metrics, filters });

    const doc = new jsPDF();
    let yPos = 15;

    // Nome do administrador logado
    const adminName = localStorage.getItem('adminName') || 'Administrador';
    
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
    yPos += 5;

    // Período
    const startDate = filters?.startDate ? format(new Date(filters.startDate), 'dd/MM/yyyy', { locale: ptBR }) : '-';
    const endDate = filters?.endDate ? format(new Date(filters.endDate), 'dd/MM/yyyy', { locale: ptBR }) : '-';
    doc.text(`Período: ${startDate} a ${endDate}`, 14, yPos);
    yPos += 5;

    // Tipo de Voucher
    doc.text("Tipo de Voucher: Descartável", 14, yPos);
    yPos += 10;

    // Totalizadores
    doc.text("Totalizadores:", 14, yPos);
    yPos += 5;
    doc.text(`Total de Registros: ${metrics?.data?.length || 0}`, 14, yPos);
    yPos += 5;
    doc.text(`Valor Total: ${formatCurrency(metrics?.totalCost || 0)}`, 14, yPos);
    yPos += 15;

    if (!metrics?.data || metrics.data.length === 0) {
      doc.text("Nenhum registro encontrado para o período selecionado.", 14, yPos);
      return doc;
    }

    // Tabela de Vouchers
    const tableData = metrics.data.map(voucher => [
      voucher.usado_em ? format(new Date(voucher.usado_em), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : '-',
      voucher.nome_pessoa || '-',
      voucher.nome_empresa || '-',
      voucher.tipos_refeicao?.nome || '-',
      '1', // Quantidade sempre será 1 para vouchers descartáveis
      formatCurrency(voucher.tipos_refeicao?.valor || 0)
    ]);

    doc.autoTable({
      startY: yPos,
      head: [['Data/Hora', 'Nome', 'Empresa', 'Refeição', 'Qtd', 'Valor']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 66, 66] }
    });

    return doc;

  } catch (error) {
    logger.error('Erro ao gerar PDF:', error);
    throw error;
  }
};