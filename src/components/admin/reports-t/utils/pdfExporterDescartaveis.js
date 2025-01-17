import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logger from '@/config/logger';
import { formatCurrency } from './formatters';
import { supabase } from '@/config/supabase';

export const exportToPDF = async (filters) => {
  try {
    logger.info('Iniciando exportação PDF de vouchers descartáveis...');

    // Buscar dados dos vouchers descartáveis
    let query = supabase
      .from('vouchers_descartaveis')
      .select(`
        *,
        tipos_refeicao (
          nome,
          valor
        )
      `)
      .order('data_uso', { ascending: false });

    // Aplicar filtro de tipo de refeição se especificado
    if (filters?.mealType && filters.mealType !== 'all') {
      query = query.eq('tipo_refeicao_id', filters.mealType);
    }

    // Aplicar filtros de data
    if (filters?.startDate) {
      query = query.gte('data_uso', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('data_uso', filters.endDate);
    }

    const { data: vouchers, error } = await query;

    if (error) {
      logger.error('Erro ao buscar vouchers:', error);
      throw error;
    }

    // Calcular totalizadores
    const totalRegistros = vouchers?.length || 0;
    const valorTotal = vouchers?.reduce((acc, voucher) => 
      acc + (voucher.tipos_refeicao?.valor || 0), 0);

    // Criar PDF
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

    // Tipo de Voucher
    doc.text("Tipo de Voucher: Descartável", 14, yPos);
    yPos += 5;

    // Tipo de Refeição (se filtrado)
    if (filters?.mealType && filters.mealType !== 'all') {
      const tipoRefeicao = vouchers[0]?.tipos_refeicao?.nome || 'Não especificado';
      doc.text(`Tipo de Refeição: ${tipoRefeicao}`, 14, yPos);
      yPos += 5;
    }

    // Período
    const startDate = filters?.startDate ? format(new Date(filters.startDate), 'dd/MM/yyyy', { locale: ptBR }) : '-';
    const endDate = filters?.endDate ? format(new Date(filters.endDate), 'dd/MM/yyyy', { locale: ptBR }) : '-';
    doc.text(`Período: ${startDate} a ${endDate}`, 14, yPos);
    yPos += 10;

    // Totalizadores
    doc.text("Totalizadores:", 14, yPos);
    yPos += 5;
    doc.text(`Total de Registros: ${totalRegistros}`, 14, yPos);
    yPos += 5;
    doc.text(`Valor Total: ${formatCurrency(valorTotal)}`, 14, yPos);
    yPos += 15;

    if (!vouchers || vouchers.length === 0) {
      doc.text("Nenhum registro encontrado para o período selecionado.", 14, yPos);
      doc.save('relatorio-vouchers-descartaveis.pdf');
      return;
    }

    // Tabela de Vouchers
    const tableData = vouchers.map(voucher => [
      voucher.data_uso ? format(new Date(voucher.data_uso), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : '-',
      voucher.nome_pessoa || '-',
      voucher.nome_empresa || '-',
      voucher.tipos_refeicao?.nome || '-',
      formatCurrency(voucher.tipos_refeicao?.valor || 0)
    ]);

    doc.autoTable({
      startY: yPos,
      head: [['Data/Hora', 'Nome', 'Empresa', 'Refeição', 'Valor']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 66, 66] }
    });

    doc.save('relatorio-vouchers-descartaveis.pdf');
    logger.info('PDF gerado com sucesso', { totalRegistros, valorTotal });

  } catch (error) {
    logger.error('Erro ao gerar PDF:', error);
    throw error;
  }
};