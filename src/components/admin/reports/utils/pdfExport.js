import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logger from '@/config/logger';
import { formatCurrency, formatDate } from './formatters';

export const exportToPDF = async (metrics, filters) => {
  try {
    logger.info('Iniciando geração do PDF:', { 
      metrics: {
        totalRegistros: metrics?.data?.length,
        totalCost: metrics?.totalCost,
        averageCost: metrics?.averageCost
      }, 
      filters 
    });

    const doc = new jsPDF();
    
    // Título e cabeçalho
    doc.setFontSize(16);
    doc.text("Relatório de Uso de Vouchers", 14, 15);
    
    // Informações do usuário que exportou
    doc.setFontSize(8);
    const dataExportacao = format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    const nomeUsuario = filters.userName || 'Usuário do Sistema';
    doc.text(`Exportado por: ${nomeUsuario} em ${dataExportacao}`, 14, 22);
    
    // Período do relatório
    doc.setFontSize(10);
    const startDate = filters.startDate ? formatDate(filters.startDate) : '-';
    const endDate = filters.endDate ? formatDate(filters.endDate) : '-';
    doc.text(`Período: ${startDate} a ${endDate}`, 14, 32);

    // Seção de Filtros Aplicados
    let yPos = 42;
    doc.text("Filtros Aplicados:", 14, yPos);
    yPos += 8;

    // Empresa
    if (filters.companyName && filters.company !== 'all') {
      doc.text(`• Empresa: ${filters.companyName}`, 20, yPos);
      yPos += 8;
    }

    // Setor
    if (filters.sectorName && filters.sector !== 'all') {
      doc.text(`• Setor: ${filters.sectorName}`, 20, yPos);
      yPos += 8;
    }

    // Turno
    if (filters.shiftName && filters.shift !== 'all') {
      doc.text(`• Turno: ${filters.shiftName}`, 20, yPos);
      yPos += 8;
    }

    // Tipo de Refeição
    if (filters.mealTypeName && filters.mealType !== 'all') {
      doc.text(`• Tipo de Refeição: ${filters.mealTypeName}`, 20, yPos);
      yPos += 8;
    }

    // Se nenhum filtro foi aplicado
    if ((!filters.company || filters.company === 'all') && 
        (!filters.sector || filters.sector === 'all') && 
        (!filters.shift || filters.shift === 'all') && 
        (!filters.mealType || filters.mealType === 'all')) {
      doc.text(`• Nenhum filtro aplicado`, 20, yPos);
      yPos += 8;
    }

    // Valor Total
    yPos += 8;
    const valorTotal = formatCurrency(metrics?.totalCost || 0);
    doc.text(`Valor Total: ${valorTotal}`, 14, yPos);

    if (!metrics?.data || metrics.data.length === 0) {
      yPos += 10;
      doc.text("Nenhum registro encontrado para o período selecionado.", 14, yPos);
      doc.save('relatorio-vouchers.pdf');
      return;
    }

    // Tabela de dados
    yPos += 10;
    doc.setFontSize(14);
    doc.text("Vouchers Utilizados", 14, yPos);

    const tableData = metrics.data.map(item => [
      formatDate(item.data_uso),
      item.nome_usuario || '-',
      item.tipo_refeicao || '-',
      formatCurrency(item.valor_refeicao || 0),
      item.turno || '-',
      item.nome_setor || '-',
      item.voucher_descartavel_id ? 'Descartável' : 'Comum'
    ]);

    doc.autoTable({
      startY: yPos + 10,
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

    doc.save('relatorio-vouchers.pdf');
    return doc;
  } catch (error) {
    logger.error('Erro ao gerar PDF:', error);
    throw error;
  }
};