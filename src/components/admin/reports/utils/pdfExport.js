import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { toast } from "sonner";

export const exportToPDF = (metrics, filters) => {
  try {
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text("Relatório de Custos de Refeições", 14, 15);
    
    doc.setFontSize(10);
    doc.text(`Período: ${format(filters.startDate, 'dd/MM/yyyy')} a ${format(filters.endDate, 'dd/MM/yyyy')}`, 14, 25);
    doc.text(`Empresa: ${filters.company === 'all' ? 'Todas' : filters.company}`, 14, 30);
    doc.text(`Turno: ${filters.shift === 'all' ? 'Todos' : filters.shift}`, 14, 35);
    doc.text(`Tipo de Refeição: ${filters.mealType === 'all' ? 'Todos' : filters.mealType}`, 14, 40);

    const tableData = metrics.filteredData.map(item => [
      format(new Date(item.data_uso), 'dd/MM/yyyy HH:mm'),
      item.nome_usuario || '-',
      item.codigo_voucher || '-',
      item.tipo_refeicao || '-',
      new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
      }).format(item.valor_refeicao || 0),
      item.turno || '-',
      item.empresa || '-'
    ]);

    doc.autoTable({
      startY: 50,
      head: [['Data/Hora', 'Usuário', 'Voucher', 'Refeição', 'Valor', 'Turno', 'Empresa']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 66, 66] }
    });

    doc.save(`relatorio-refeicoes-${format(new Date(), 'dd-MM-yyyy')}.pdf`);
    toast.success("Relatório exportado com sucesso!");
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    toast.error("Erro ao gerar relatório");
  }
};