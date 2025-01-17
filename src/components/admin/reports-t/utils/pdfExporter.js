import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logger from '@/config/logger';

export const exportToPDF = async (metrics, filters) => {
  try {
    console.log('Dados recebidos para PDF:', metrics);
    
    if (!metrics || !Array.isArray(metrics)) {
      console.error('Dados inválidos recebidos:', metrics);
      throw new Error('Dados inválidos para geração do PDF');
    }

    const doc = new jsPDF();
    let yPos = 20;

    // Cabeçalho
    doc.setFontSize(16);
    doc.text("Relatório Consumo de Refeições", 14, yPos);
    yPos += 10;

    // Informações do administrador e data/hora
    doc.setFontSize(10);
    const adminName = localStorage.getItem('adminName') || 'Usuário não identificado';
    const dataExportacao = format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    doc.text(`Relatório gerado por ${adminName}`, 14, yPos);
    yPos += 6;
    doc.text(`Data de exportação: ${dataExportacao}`, 14, yPos);
    yPos += 10;

    // Totalizadores no topo
    const totalRegistros = metrics.length;
    const valorTotal = metrics.reduce((sum, item) => sum + (Number(item.tipos_refeicao?.valor) || 0), 0);
    
    doc.setFontSize(12);
    doc.text("Totalizadores:", 14, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.text(`Total de Registros: ${totalRegistros}`, 14, yPos);
    yPos += 6;
    doc.text(`Valor Total: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorTotal)}`, 14, yPos);
    yPos += 10;

    // Informações do relatório
    if (filters?.startDate && filters?.endDate) {
      doc.text(`Período: ${format(new Date(filters.startDate), 'dd/MM/yyyy')} a ${format(new Date(filters.endDate), 'dd/MM/yyyy')}`, 14, yPos);
      yPos += 6;
    }

    if (filters?.company && filters.company !== 'all') {
      // Usando o nome da empresa do primeiro registro encontrado
      const empresaNome = metrics.length > 0 ? metrics[0].nome_empresa : 'N/A';
      doc.text(`Empresa: ${empresaNome}`, 14, yPos);
      yPos += 6;
    }

    if (filters?.shift && filters.shift !== 'all') {
      doc.text(`Turno: ${filters.shiftName || filters.shift}`, 14, yPos);
      yPos += 6;
    }

    yPos += 10;

    // Verificar se há dados
    if (metrics.length === 0) {
      doc.setFontSize(12);
      doc.text("Nenhum registro encontrado para os filtros selecionados.", 14, yPos);
      return doc;
    }

    // Preparar dados para a tabela
    const tableData = metrics.map(item => {
      try {
        return [
          format(new Date(item.usado_em), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
          item.nome_pessoa || '-',
          item.tipos_refeicao?.nome || '-',
          new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
            .format(item.tipos_refeicao?.valor || 0),
          item.turno || '-',
          item.setor || '-'
        ];
      } catch (error) {
        console.error('Erro ao processar item:', { item, error });
        return ['-', '-', '-', '-', '-', '-'];
      }
    });

    // Configurar e gerar a tabela
    doc.autoTable({
      startY: yPos,
      head: [['Data/Hora', 'Nome', 'Refeição', 'Valor', 'Turno', 'Setor']],
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
        0: { cellWidth: 30 },
        1: { cellWidth: 40 },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
        4: { cellWidth: 20 },
        5: { cellWidth: 25 }
      }
    });

    console.log('PDF gerado com sucesso:', {
      totalRegistros: metrics.length,
      valorTotal: valorTotal
    });

    return doc;
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw error;
  }
};