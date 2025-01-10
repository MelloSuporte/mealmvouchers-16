import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const generatePDF = (data) => {
  const doc = new jsPDF();
  const adminName = localStorage.getItem('adminName') || 'Não identificado';
  
  doc.setFontSize(16);
  doc.text('Requisição de Refeição Extra', 14, 20);
  
  doc.setFontSize(12);
  doc.text(`Data: ${new Date().toLocaleDateString()}`, 14, 30);
  doc.text(`Usuário: ${data.usuario?.nome || '-'}`, 14, 40);
  doc.text(`CPF: ${data.usuario?.cpf || '-'}`, 14, 50);
  doc.text(`Solicitante: ${adminName}`, 14, 60);
  doc.text(`Quantidade: ${data.quantidade || '0'}`, 14, 70);
  doc.text(`Valor: R$ ${parseFloat(data.valor || 0).toFixed(2)}`, 14, 80);
  doc.text(`Data de Consumo: ${new Date(data.data_consumo).toLocaleDateString()}`, 14, 90);
  
  if (data.observacao) {
    doc.text('Observação:', 14, 100);
    doc.setFontSize(10);
    const splitObservacao = doc.splitTextToSize(data.observacao, 180);
    doc.text(splitObservacao, 14, 110);
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
    meal.usuarios?.nome || '-',
    meal.refeicoes?.nome || '-',
    meal.quantidade?.toString() || '0',
    `R$ ${(meal.valor || 0).toFixed(2)}`
  ]);
  
  const total = meals.reduce((acc, meal) => acc + ((meal.valor || 0) * (meal.quantidade || 0)), 0);
  
  doc.autoTable({
    startY: 40,
    head: [['Data', 'Usuário', 'Refeição', 'Qtd', 'Valor']],
    body: tableData,
    foot: [['', '', 'Total:', '', `R$ ${total.toFixed(2)}`]],
  });
  
  doc.save('relatorio-refeicoes-extras.pdf');
};