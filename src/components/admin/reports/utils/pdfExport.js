import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logger from '@/config/logger';

const formatCurrency = (value) => {
  if (!value || isNaN(value)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const formatDate = (date) => {
  if (!date) return '-';
  try {
    return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: ptBR });
  } catch (error) {
    logger.error('Erro ao formatar data:', error, { date });
    return '-';
  }
};

export const exportToPDF = async (metrics, filters) => {
  try {
    logger.info('Iniciando geração do PDF:', { filters });

    const doc = new jsPDF();
    
    // Cabeçalho
    doc.setFontSize(16);
    doc.text("Relatório de Uso de Vouchers", 14, 15);
    
    // Informações do usuário que exportou
    doc.setFontSize(8);
    const dataExportacao = format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    doc.text(`Exportado por: ${filters.userName} em ${dataExportacao}`, 14, 22);
    
    // Informações dos filtros
    doc.setFontSize(10);
    doc.text("Informações do Relatório:", 14, 30);
    
    // Empresa
    doc.text(`Empresa: ${filters.companyName}`, 14, 40);
    
    // Período
    const startDate = filters.startDate ? formatDate(filters.startDate) : '-';
    const endDate = filters.endDate ? formatDate(filters.endDate) : '-';
    doc.text(`Período: ${startDate} a ${endDate}`, 14, 50);
    
    // Turno
    doc.text(`Turno: ${filters.shiftName}`, 14, 60);
    
    // Setor
    doc.text(`Setor: ${filters.sectorName}`, 14, 70);
    
    // Tipo de Refeição
    doc.text(`Tipo de Refeição: ${filters.mealTypeName}`, 14, 80);
    
    // Valor Total
    const valorTotal = formatCurrency(metrics?.totalCost || 0);
    doc.text(`Valor Total: ${valorTotal}`, 14, 90);

    // Se houver dados, adiciona a tabela detalhada
    if (metrics?.data && metrics.data.length > 0) {
      const tableData = metrics.data.map(item => [
        formatDate(item.data_uso),
        item.nome_usuario || '-',
        item.cpf || '-',
        item.nome_empresa || '-',
        item.tipo_refeicao || '-',
        formatCurrency(item.valor),
        item.turno || '-',
        item.nome_setor || '-'
      ]);

      doc.autoTable({
        startY: 100,
        head: [['Data/Hora', 'Usuário', 'CPF', 'Empresa', 'Refeição', 'Valor', 'Turno', 'Setor']],
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
        }
      });
    } else {
      doc.text("Nenhum registro encontrado para o período selecionado.", 14, 100);
    }

    const fileName = `relatorio-vouchers-${format(new Date(), 'dd-MM-yyyy-HH-mm', { locale: ptBR })}.pdf`;
    doc.save(fileName);
    
    return fileName;
  } catch (error) {
    logger.error('Erro ao gerar PDF:', error);
    throw error;
  }
};