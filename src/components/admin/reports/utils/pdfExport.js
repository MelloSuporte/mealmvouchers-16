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
    doc.text("Relatório de Uso de Vouchers", 14, 15);
    
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
    
    // Turno
    const turnoNome = filters.shiftName || (filters.shift === 'all' ? 'Todos os Turnos' : 'Turno não especificado');
    doc.text(`Turno: ${turnoNome}`, 14, 50);
    
    // Setor
    const setorNome = filters.sectorName || (filters.sector === 'all' ? 'Todos os Setores' : 'Setor não especificado');
    doc.text(`Setor: ${setorNome}`, 14, 60);
    
    // Tipo de Refeição
    const tipoRefeicao = filters.mealTypeName || (filters.mealType === 'all' ? 'Todos os Tipos' : 'Tipo não especificado');
    doc.text(`Tipo de Refeição: ${tipoRefeicao}`, 14, 70);
    
    // Valor Total
    const valorTotal = formatCurrency(metrics?.totalCost || 0);
    doc.text(`Valor Total: ${valorTotal}`, 14, 80);

    if (!metrics?.data || metrics.data.length === 0) {
      doc.text("Nenhum registro encontrado para o período selecionado.", 14, 90);
      doc.save('relatorio-vouchers.pdf');
      return;
    }

    // Tabelas
    doc.setFontSize(14);
    doc.text("Vouchers Utilizados", 14, 100);

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
      startY: 110,
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