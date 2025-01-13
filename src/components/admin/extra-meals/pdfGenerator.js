import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generatePDF = (data) => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(16);
  doc.text('Refeição Extra', 14, 20);
  
  // Add date
  doc.setFontSize(12);
  doc.text(`Data: ${format(new Date(data.data_consumo), "dd/MM/yyyy", { locale: ptBR })}`, 14, 30);
  
  // Add meal info
  doc.text(`Refeição: ${data.nome_refeicao}`, 14, 40);
  doc.text(`Valor: R$ ${Number(data.valor).toFixed(2)}`, 14, 50);
  doc.text(`Quantidade: ${data.quantidade || 1}`, 14, 60);
  
  if (data.observacao) {
    doc.text(`Observação: ${data.observacao}`, 14, 70);
  }
  
  // Add users table
  const tableData = data.usuarios.map(user => [
    user.nome,
    user.cpf
  ]);

  doc.autoTable({
    startY: data.observacao ? 80 : 70,
    head: [['Nome', 'CPF']],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 10
    }
  });
  
  doc.save('refeicao-extra.pdf');
};

export const generateReportPDF = (meals, dateRange, selectedMeal, mealTypes) => {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(16);
  doc.text('Relatório de Refeições Extras', 14, 20);
  
  doc.setFontSize(12);
  doc.text(`Período: ${format(new Date(dateRange.start + 'T12:00:00'), "dd/MM/yyyy", { locale: ptBR })} a ${format(new Date(dateRange.end + 'T12:00:00'), "dd/MM/yyyy", { locale: ptBR })}`, 14, 30);
  
  // Add meal type filter info
  if (selectedMeal !== 'all') {
    const selectedMealName = mealTypes?.find(m => m.id === selectedMeal)?.nome || 'Não especificada';
    doc.text(`Refeição: ${selectedMealName}`, 14, 40);
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString + 'T12:00:00');
    return format(date, "dd/MM/yyyy", { locale: ptBR });
  };

  const tableData = meals.map(meal => [
    formatDate(meal.data_consumo),
    meal.usuarios?.nome || '-',
    meal.refeicoes?.nome || '-',
    meal.quantidade?.toString() || '0',
    `R$ ${meal.valor.toFixed(2)}`
  ]);

  // Calculate totals
  const totalQuantity = meals.reduce((sum, meal) => sum + (meal.quantidade || 0), 0);
  const totalValue = meals.reduce((sum, meal) => sum + (meal.valor || 0), 0);

  doc.autoTable({
    startY: selectedMeal !== 'all' ? 45 : 35,
    head: [['Data', 'Usuário', 'Refeição', 'Quantidade', 'Valor']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [66, 66, 66],
      textColor: [255, 255, 255]
    },
    foot: [['Total', '', '', totalQuantity.toString(), `R$ ${totalValue.toFixed(2)}`]],
    footStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontStyle: 'bold'
    }
  });
  
  doc.save('relatorio-refeicoes-extras.pdf');
};