import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { toast } from "sonner";

export const exportToPDF = (metrics, filters) => {
  try {
    if (!metrics?.filteredData?.length) {
      toast.error("Não há dados para exportar");
      return;
    }

    console.log('Dados para exportação:', metrics);

    const doc = new jsPDF();
    
    // Configuração do cabeçalho
    doc.setFontSize(16);
    doc.text("Relatório de Custos de Refeições", 14, 15);
    
    doc.setFontSize(10);
    doc.text(`Período: ${format(filters.startDate, 'dd/MM/yyyy', { locale: ptBR })} a ${format(filters.endDate, 'dd/MM/yyyy', { locale: ptBR })}`, 14, 25);
    
    // Usar os nomes corretos das empresas e turnos do objeto metrics
    const empresaNome = metrics.filteredData[0]?.usuario?.empresa?.nome || 'Todas';
    const turnoNome = metrics.filteredData[0]?.usuario?.turno?.tipo_turno || 'Todos';
    const tipoRefeicaoNome = metrics.filteredData[0]?.tipo_refeicao?.nome || 'Todos';

    doc.text(`Empresa: ${filters.company === 'all' ? 'Todas' : empresaNome}`, 14, 30);
    doc.text(`Turno: ${filters.shift === 'all' ? 'Todos' : turnoNome}`, 14, 35);
    doc.text(`Tipo de Refeição: ${filters.mealType === 'all' ? 'Todos' : tipoRefeicaoNome}`, 14, 40);

    // Métricas resumidas
    doc.text("Resumo:", 14, 50);
    doc.text(`Total Gasto: R$ ${metrics.totalCost?.toFixed(2) || '0,00'}`, 14, 55);
    doc.text(`Custo Médio: R$ ${metrics.averageCost?.toFixed(2) || '0,00'}`, 14, 60);
    doc.text(`Vouchers Regulares: ${metrics.regularVouchers || 0}`, 14, 65);
    doc.text(`Vouchers Descartáveis: ${metrics.disposableVouchers || 0}`, 14, 70);

    // Dados detalhados em tabela
    const tableData = metrics.filteredData.map(item => [
      format(new Date(item.usado_em), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
      item.usuario?.nome || '-',
      item.codigo_voucher || '-',
      item.tipo_refeicao?.nome || '-',
      `R$ ${parseFloat(item.tipo_refeicao?.valor || 0).toFixed(2)}`,
      item.usuario?.turno?.tipo_turno || '-',
      item.usuario?.empresa?.nome || '-'
    ]);

    doc.autoTable({
      startY: 80,
      head: [['Data/Hora', 'Usuário', 'Voucher', 'Refeição', 'Valor', 'Turno', 'Empresa']],
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
        0: { cellWidth: 30 },
        1: { cellWidth: 40 },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
        4: { cellWidth: 20 },
        5: { cellWidth: 20 },
        6: { cellWidth: 30 }
      }
    });

    // Nome do arquivo com data e hora atual
    const fileName = `relatorio-refeicoes-${format(new Date(), 'dd-MM-yyyy-HH-mm', { locale: ptBR })}.pdf`;
    doc.save(fileName);
    
    toast.success("Relatório exportado com sucesso!");
    console.log('Relatório exportado:', fileName);
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    toast.error("Erro ao gerar relatório: " + error.message);
  }
};