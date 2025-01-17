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
    let yPos = 15;
    
    // Título
    doc.setFontSize(16);
    doc.text("Relatório de Uso de Vouchers Comuns", 14, yPos);
    yPos += 10;
    
    // Data de exportação
    doc.setFontSize(8);
    const dataExportacao = format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    doc.text(`Exportado em ${dataExportacao}`, 14, yPos);
    yPos += 15;
    
    // Informações do Relatório
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

    // Empresa - Usando o nome da empresa dos dados
    if (filters.company && filters.company !== 'all' && metrics?.data?.length > 0) {
      const empresaFiltrada = metrics.data.find(item => item.nome_empresa)?.nome_empresa;
      if (empresaFiltrada) {
        doc.text(`• Empresa: ${empresaFiltrada}`, 20, yPos);
        yPos += 8;
        filtrosAplicados = true;
      }
    }

    // Setor
    if (filters.sector && filters.sector !== 'all' && metrics?.data?.length > 0) {
      const setorFiltrado = metrics.data.find(item => item.setor)?.setor;
      if (setorFiltrado) {
        doc.text(`• Setor: ${setorFiltrado}`, 20, yPos);
        yPos += 8;
        filtrosAplicados = true;
      }
    }

    // Turno
    if (filters.shift && filters.shift !== 'all' && metrics?.data?.length > 0) {
      const turnoFiltrado = metrics.data.find(item => item.turno)?.turno;
      if (turnoFiltrado) {
        doc.text(`• Turno: ${turnoFiltrado}`, 20, yPos);
        yPos += 8;
        filtrosAplicados = true;
      }
    }

    // Tipo de Refeição
    if (filters.mealType && filters.mealType !== 'all' && metrics?.data?.length > 0) {
      const tipoRefeicaoFiltrado = metrics.data.find(item => item.tipos_refeicao?.nome)?.tipos_refeicao?.nome;
      if (tipoRefeicaoFiltrado) {
        doc.text(`• Tipo de Refeição: ${tipoRefeicaoFiltrado}`, 20, yPos);
        yPos += 8;
        filtrosAplicados = true;
      }
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
      doc.save('relatorio-vouchers.pdf');
      return doc;
    }

    // Tabela de Vouchers
    doc.setFontSize(14);
    doc.text("Vouchers Utilizados", 14, yPos);
    yPos += 10;

    const tableData = metrics.data.map(item => [
      formatDate(item.usado_em),
      item.codigo,
      item.nome_pessoa,
      item.tipos_refeicao?.nome || '-',
      formatCurrency(item.tipos_refeicao?.valor || 0),
      item.turno || '-',
      item.setor || '-'
    ]);

    doc.autoTable({
      startY: yPos,
      head: [['Data/Hora', 'Código', 'Usuário', 'Refeição', 'Valor', 'Turno', 'Setor']],
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
        1: { cellWidth: 20 },
        2: { cellWidth: 35 },
        3: { cellWidth: 25 },
        4: { cellWidth: 20 },
        5: { cellWidth: 20 },
        6: { cellWidth: 20 }
      }
    });

    doc.save('relatorio-vouchers.pdf');
    return doc;
  } catch (error) {
    logger.error('Erro ao gerar PDF:', error);
    throw error;
  }
};