import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logger from '@/config/logger';
import { formatCurrency, formatDate } from './formatters';

export const exportToPDF = async (data, filters, adminName) => {
  try {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(16);
    doc.text("Relatório de Uso de Vouchers", 14, 15);
    
    // Informações do usuário que exportou
    doc.setFontSize(10);
    const currentUser = adminName || 'Usuário não identificado';
    const exportDate = format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    doc.text(`Exportado por: ${currentUser} em ${exportDate}`, 14, 25);

    // Informações do Relatório
    doc.setFontSize(12);
    doc.text("Informações do Relatório:", 14, 35);

    // Empresa
    const empresaNome = filters.company === 'all' ? 'Todas as Empresas' : data?.[0]?.nome_empresa || 'Empresa não especificada';
    doc.text(`Empresa: ${empresaNome}`, 14, 45);

    // Período
    const startDate = filters.startDate ? format(new Date(filters.startDate), 'dd/MM/yyyy', { locale: ptBR }) : '-';
    const endDate = filters.endDate ? format(new Date(filters.endDate), 'dd/MM/yyyy', { locale: ptBR }) : '-';
    doc.text(`Período: ${startDate} a ${endDate}`, 14, 55);

    // Turno
    const turnoNome = filters.shift === 'all' ? 'Todos os Turnos' : data?.[0]?.turno || 'Turno não especificado';
    doc.text(`Turno: ${turnoNome}`, 14, 65);

    // Setor
    const setorNome = filters.sector === 'all' ? 'Todos os Setores' : data?.[0]?.nome_setor || 'Setor não especificado';
    doc.text(`Setor: ${setorNome}`, 14, 75);

    // Tipo de Refeição
    const tipoRefeicao = filters.mealType === 'all' ? 'Todos os Tipos' : data?.[0]?.tipo_refeicao || 'Tipo não especificado';
    doc.text(`Tipo de Refeição: ${tipoRefeicao}`, 14, 85);

    // Valor Total
    const totalValue = data?.reduce((sum, item) => sum + (parseFloat(item.valor_refeicao) || 0), 0) || 0;
    doc.text(`Valor Total: ${formatCurrency(totalValue)}`, 14, 95);

    // Quantidade de Refeições
    const totalMeals = data?.length || 0;
    doc.text(`Quantidade de Refeições: ${totalMeals}`, 14, 105);

    if (!data || data.length === 0) {
      doc.text("Nenhum registro encontrado para o período selecionado.", 14, 115);
      return doc;
    }

    // Tabelas
    doc.setFontSize(14);
    doc.text("Vouchers Utilizados", 14, 125);
    
    const tableData = data.map(item => [
      formatDate(item.data_uso),
      item.nome_usuario || '-',
      item.cpf || '-',
      item.tipo_refeicao || '-',
      formatCurrency(item.valor_refeicao || 0),
      item.turno || '-',
      item.nome_setor || '-',
      item.tipo_voucher || 'comum'
    ]);

    doc.autoTable({
      startY: 135,
      head: [['Data/Hora', 'Usuário', 'CPF', 'Refeição', 'Valor', 'Turno', 'Setor', 'Tipo Voucher']],
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

    return doc;
  } catch (error) {
    logger.error('Erro ao gerar PDF:', error);
    throw error;
  }
};