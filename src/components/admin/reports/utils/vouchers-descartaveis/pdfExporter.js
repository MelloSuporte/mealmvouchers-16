import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logger from '@/config/logger';

export const exportToPDF = async (metrics, filters) => {
  try {
    logger.info('Iniciando geração do PDF de vouchers descartáveis:', { metrics, filters });
    
    // Ajustar as datas para considerar o dia inteiro
    const startDate = filters?.startDate ? new Date(filters.startDate) : null;
    const endDate = filters?.endDate ? new Date(filters.endDate) : null;

    if (startDate) {
      startDate.setHours(0, 0, 0, 0);
    }
    
    if (endDate) {
      endDate.setHours(23, 59, 59, 999);
    }

    // Buscar dados com as datas ajustadas
    let query = supabase
      .from('vouchers_descartaveis')
      .select(`
        *,
        tipos_refeicao (
          id,
          nome,
          valor
        )
      `)
      .order('usado_em', { ascending: false });

    if (startDate) {
      query = query.gte('usado_em', startDate.toISOString());
    }

    if (endDate) {
      query = query.lte('usado_em', endDate.toISOString());
    }

    const { data: vouchers, error } = await query;

    if (error) {
      logger.error('Erro ao buscar vouchers:', error);
      throw error;
    }

    // Criar PDF
    const doc = new jsPDF();
    let yPos = 20;

    // Cabeçalho
    doc.setFontSize(16);
    doc.text("Relatório de Vouchers Descartáveis", 14, yPos);
    yPos += 10;

    // Informações do relatório
    doc.setFontSize(10);
    const dataExportacao = format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    doc.text(`Relatório gerado em ${dataExportacao}`, 14, yPos);
    yPos += 10;

    // Período do relatório
    if (startDate && endDate) {
      doc.text(
        `Período: ${format(startDate, 'dd/MM/yyyy')} a ${format(endDate, 'dd/MM/yyyy')}`,
        14,
        yPos
      );
      yPos += 10;
    }

    // Totalizadores
    const totalRegistros = vouchers?.length || 0;
    const valorTotal = vouchers?.reduce((sum, item) => 
      sum + (item.tipos_refeicao?.valor || 0), 0
    );

    doc.text(`Total de Registros: ${totalRegistros}`, 14, yPos);
    yPos += 6;
    doc.text(
      `Valor Total: ${new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
      }).format(valorTotal)}`,
      14,
      yPos
    );
    yPos += 10;

    if (!vouchers || vouchers.length === 0) {
      doc.setFontSize(12);
      doc.text("Nenhum registro encontrado para o período selecionado.", 14, yPos);
      return doc;
    }

    // Tabela de dados
    const tableData = vouchers.map(voucher => [
      format(new Date(voucher.usado_em), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
      voucher.nome_pessoa || '-',
      voucher.tipos_refeicao?.nome || '-',
      new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
      }).format(voucher.tipos_refeicao?.valor || 0),
      voucher.codigo || '-',
      voucher.nome_empresa || '-'
    ]);

    doc.autoTable({
      startY: yPos + 10,
      head: [['Data/Hora', 'Pessoa', 'Refeição', 'Valor', 'Código', 'Empresa']],
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
        5: { cellWidth: 30 }
      }
    });

    logger.info('PDF de vouchers descartáveis gerado com sucesso');
    return doc;
  } catch (error) {
    logger.error('Erro ao gerar PDF:', error);
    throw error;
  }
};