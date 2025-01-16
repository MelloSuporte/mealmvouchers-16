import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logger from '@/config/logger';
import { formatCurrency, formatDate } from './formatters';

export const exportToPDF = async (data, filters, adminName) => {
  try {
    logger.info('Iniciando geração do PDF:', { 
      metrics: {
        totalRegistros: data?.length,
        totalCost: data?.reduce((sum, item) => sum + (parseFloat(item.valor_refeicao) || 0), 0)
      }, 
      filters 
    });

    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(16);
    doc.text("Relatório de Uso de Vouchers Descartáveis", 14, 15);
    
    // Informações do usuário que exportou
    doc.setFontSize(8);
    const dataExportacao = format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    const nomeUsuario = adminName || 'Usuário do Sistema';
    doc.text(`Exportado por: ${nomeUsuario} em ${dataExportacao}`, 14, 22);
    
    // Informações do Relatório
    doc.setFontSize(10);
    doc.text("Informações do Relatório:", 14, 30);
    
    // Período
    const startDate = filters.startDate ? formatDate(filters.startDate) : '-';
    const endDate = filters.endDate ? formatDate(filters.endDate) : '-';
    doc.text(`Período: ${startDate} a ${endDate}`, 14, 38);
    
    // Métricas Gerais
    doc.text("Métricas Gerais:", 14, 46);
    
    // Valor Total
    const valorTotal = data?.reduce((sum, item) => sum + (parseFloat(item.valor_refeicao) || 0), 0) || 0;
    doc.text(`Valor Total: ${formatCurrency(valorTotal)}`, 14, 54);

    // Quantidade de Refeições
    const totalMeals = data?.length || 0;
    doc.text(`Quantidade de Refeições: ${totalMeals}`, 14, 62);

    if (!data || data.length === 0) {
      doc.text("Nenhum registro encontrado para o período selecionado.", 14, 70);
      return doc;
    }

    // Tabela de Vouchers
    doc.setFontSize(14);
    doc.text("Vouchers Utilizados", 14, 78);

    const tableData = data.map(item => [
      formatDate(item.data_uso),
      item.nome_pessoa || '-',
      item.nome_empresa || '-',
      item.tipo_refeicao || '-',
      formatCurrency(item.valor_refeicao || 0),
      item.empresa_nome || '-',
      item.codigo || '-',
      formatCurrency(item.valor_refeicao || 0)
    ]);

    doc.autoTable({
      startY: 86,
      head: [['Data/Hora', 'Nome', 'Empresa Voucher', 'Refeição', 'Valor', 'Empresa', 'Código', 'Valor']],
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
        1: { cellWidth: 30 },
        2: { cellWidth: 30 },
        3: { cellWidth: 20 },
        4: { cellWidth: 20 },
        5: { cellWidth: 30 },
        6: { cellWidth: 20 },
        7: { cellWidth: 20 }
      }
    });

    return doc;
  } catch (error) {
    logger.error('Erro ao gerar PDF:', error);
    throw error;
  }
};