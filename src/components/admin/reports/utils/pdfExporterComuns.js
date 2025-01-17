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
    
    // Título
    doc.setFontSize(16);
    doc.text("Relatório de Uso de Vouchers Comuns", 14, 15);
    
    // Informações do usuário que exportou
    doc.setFontSize(8);
    const dataExportacao = format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    doc.text(`Exportado em ${dataExportacao}`, 14, 22);
    
    // Informações do Relatório
    doc.setFontSize(10);
    doc.text("Informações do Relatório:", 14, 30);
    
    // Período
    const startDate = filters.startDate ? formatDate(filters.startDate) : '-';
    const endDate = filters.endDate ? formatDate(filters.endDate) : '-';
    doc.text(`Período: ${startDate} a ${endDate}`, 14, 40);

    // Filtros Aplicados
    let currentY = 50;
    doc.text("Filtros Aplicados:", 14, currentY);
    currentY += 8;

    let filtrosAplicados = false;

    // Empresa - Agora usando o nome da empresa dos dados
    if (filters.company && filters.company !== 'all' && metrics?.data?.length > 0) {
      // Pegamos o nome da empresa do primeiro registro dos dados
      const nomeEmpresa = metrics.data[0].nome_empresa;
      doc.text(`• Empresa: ${nomeEmpresa || 'Não especificada'}`, 20, currentY);
      currentY += 8;
      filtrosAplicados = true;
    }

    // Setor
    if (filters.sector && filters.sector !== 'all') {
      doc.text(`• Setor: ${filters.sectorName || filters.sector}`, 20, currentY);
      currentY += 8;
      filtrosAplicados = true;
    }

    // Turno
    if (filters.shift && filters.shift !== 'all') {
      doc.text(`• Turno: ${filters.shiftName || filters.shift}`, 20, currentY);
      currentY += 8;
      filtrosAplicados = true;
    }

    // Tipo de Refeição
    if (filters.mealType && filters.mealType !== 'all') {
      doc.text(`• Tipo de Refeição: ${filters.mealTypeName || filters.mealType}`, 20, currentY);
      currentY += 8;
      filtrosAplicados = true;
    }

    // Se nenhum filtro foi aplicado
    if (!filtrosAplicados) {
      doc.text(`• Nenhum filtro aplicado`, 20, currentY);
      currentY += 8;
    }
    
    currentY += 8;
    
    // Valor Total
    const valorTotal = formatCurrency(metrics?.totalCost || 0);
    doc.text(`Valor Total: ${valorTotal}`, 14, currentY);
    currentY += 20;

    if (!metrics?.data || metrics.data.length === 0) {
      doc.text("Nenhum registro encontrado para o período selecionado.", 14, currentY);
      doc.save('relatorio-vouchers.pdf');
      return;
    }

    // Tabelas
    doc.setFontSize(14);
    doc.text("Vouchers Utilizados", 14, currentY);

    const tableData = metrics.data.map(item => [
      formatDate(item.usado_em),
      item.codigo,
      item.nome_pessoa,
      item.tipos_refeicao.nome,
      formatCurrency(item.tipos_refeicao.valor),
      item.turno,
      item.setor
    ]);

    doc.autoTable({
      startY: currentY + 10,
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