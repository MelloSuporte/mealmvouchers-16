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
    logger.info('Iniciando geração do PDF:', { 
      metrics: {
        totalRegistros: metrics?.data?.length,
        totalCost: metrics?.totalCost,
        averageCost: metrics?.averageCost
      }, 
      filters 
    });

    const doc = new jsPDF();
    
    // Cabeçalho
    doc.setFontSize(16);
    doc.text("Relatório de Uso de Vouchers", 14, 15);
    
    // Informações do usuário que exportou
    doc.setFontSize(8);
    const dataExportacao = format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    const nomeUsuario = filters.userName || 'Usuário do Sistema';
    doc.text(`Exportado por: ${nomeUsuario} em ${dataExportacao}`, 14, 22);
    
    // Informações dos filtros
    doc.setFontSize(10);
    doc.text("Informações do Relatório:", 14, 30);
    
    // Empresa
    const empresaNome = metrics?.data?.[0]?.nome_empresa || 'Todas as Empresas';
    doc.text(`Empresa: ${empresaNome}`, 14, 40);
    
    // Período
    const startDate = filters.startDate ? formatDate(filters.startDate) : '-';
    const endDate = filters.endDate ? formatDate(filters.endDate) : '-';
    doc.text(`Período: ${startDate} a ${endDate}`, 14, 50);
    
    // Turno
    const turnoNome = metrics?.data?.[0]?.turno || 'Todos os Turnos';
    doc.text(`Turno: ${turnoNome}`, 14, 60);
    
    // Setor
    const setorNome = metrics?.data?.[0]?.nome_setor || 'Todos os Setores';
    doc.text(`Setor: ${setorNome}`, 14, 70);
    
    // Tipo de Refeição
    const tipoRefeicao = metrics?.data?.[0]?.tipo_refeicao || 'Todos os Tipos';
    doc.text(`Tipo de Refeição: ${tipoRefeicao}`, 14, 80);
    
    // Valor Total
    const valorTotal = formatCurrency(metrics?.totalCost || 0);
    doc.text(`Valor Total: ${valorTotal}`, 14, 90);

    // Se houver dados, adiciona a tabela detalhada
    if (metrics?.data && metrics.data.length > 0) {
      logger.info('Processando dados para tabela:', { 
        quantidade: metrics.data.length 
      });

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

      logger.info('Dados formatados para tabela:', { 
        linhas: tableData.length,
        primeiraLinha: tableData[0]
      });

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
        },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 35 },
          2: { cellWidth: 25 },
          3: { cellWidth: 25 },
          4: { cellWidth: 20 },
          5: { cellWidth: 20 },
          6: { cellWidth: 20 },
          7: { cellWidth: 20 }
        }
      });
    } else {
      logger.info('Nenhum dado encontrado para o período');
      // Mensagem quando não há dados
      doc.text("Nenhum registro encontrado para o período selecionado.", 14, 100);
    }

    const fileName = `relatorio-vouchers-${format(new Date(), 'dd-MM-yyyy-HH-mm', { locale: ptBR })}.pdf`;
    
    logger.info('Salvando arquivo:', { fileName });
    doc.save(fileName);
    
    return fileName;
  } catch (error) {
    logger.error('Erro ao gerar PDF:', error, {
      stack: error.stack,
      metrics,
      filters
    });
    throw error;
  }
};