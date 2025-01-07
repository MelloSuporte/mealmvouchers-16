import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const generatePDF = (data) => {
  const doc = new jsPDF();
  
  doc.setFontSize(16);
  doc.text('Requisição de Refeição Extra', 14, 20);
  
  doc.setFontSize(12);
  doc.text(`Data: ${new Date().toLocaleDateString()}`, 14, 30);
  doc.text(`Usuário: ${data.usuario.nome}`, 14, 40);
  doc.text(`CPF: ${data.usuario.cpf}`, 14, 50);
  doc.text(`Quantidade: ${data.quantidade}`, 14, 60);
  doc.text(`Valor: R$ ${parseFloat(data.valor).toFixed(2)}`, 14, 70);
  doc.text(`Data de Consumo: ${new Date(data.data_consumo).toLocaleDateString()}`, 14, 80);
  
  if (data.observacao) {
    doc.text('Observação:', 14, 90);
    doc.setFontSize(10);
    const splitObservacao = doc.splitTextToSize(data.observacao, 180);
    doc.text(splitObservacao, 14, 100);
  }
  
  doc.save('requisicao-refeicao-extra.pdf');
};

export const generateReportPDF = (meals, dateRange) => {
  const doc = new jsPDF();
  
  doc.setFontSize(16);
  doc.text('Relatório de Refeições Extras', 14, 20);
  
  doc.setFontSize(12);
  doc.text(`Período: ${new Date(dateRange.start).toLocaleDateString()} a ${new Date(dateRange.end).toLocaleDateString()}`, 14, 30);
  
  const tableData = meals.map(meal => [
    new Date(meal.data_consumo).toLocaleDateString(),
    meal.usuarios.nome,
    meal.tipos_refeicao.nome,
    meal.quantidade.toString(),
    `R$ ${meal.valor.toFixed(2)}`
  ]);
  
  const total = meals.reduce((acc, meal) => acc + (meal.valor * meal.quantidade), 0);
  
  doc.autoTable({
    startY: 40,
    head: [['Data', 'Usuário', 'Refeição', 'Qtd', 'Valor']],
    body: tableData,
    foot: [['', '', 'Total:', '', `R$ ${total.toFixed(2)}`]],
  });
  
  doc.save('relatorio-refeicoes-extras.pdf');
};