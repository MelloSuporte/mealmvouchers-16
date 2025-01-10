import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const generatePDF = (data) => {
  const doc = new jsPDF();
  const adminName = localStorage.getItem('adminName') || 'Não identificado';
  
  doc.setFontSize(16);
  doc.text('Requisição de Refeição Extra', 14, 20);
  
  doc.setFontSize(12);
  doc.text(`Data: ${format(new Date(), "dd/MM/yyyy", { locale: ptBR })}`, 14, 30);

  // Adiciona todos os usuários selecionados
  if (Array.isArray(data.usuarios) && data.usuarios.length > 0) {
    doc.text('Usuários:', 14, 40);
    let yPosition = 50;
    data.usuarios.forEach((usuario, index) => {
      doc.text(`${index + 1}. Nome: ${usuario.nome || '-'}`, 20, yPosition);
      yPosition += 10;
    });
    yPosition += 10;
    doc.text(`Solicitante: ${adminName}`, 14, yPosition);
    doc.text(`Refeição: ${data.nome_refeicao || '-'}`, 14, yPosition + 10);
    doc.text(`Quantidade: ${data.quantidade || '0'}`, 14, yPosition + 20);
    
    // Preservar a data exata sem conversão de timezone
    const [year, month, day] = data.data_consumo.split('-');
    const dataConsumo = new Date(year, month - 1, day);
    doc.text(`Data de Consumo: ${format(dataConsumo, "EEEE, dd/MM/yyyy", { locale: ptBR })}`, 14, yPosition + 30);
    
    if (data.observacao) {
      doc.text('Observação:', 14, yPosition + 40);
      doc.setFontSize(10);
      const splitObservacao = doc.splitTextToSize(data.observacao, 180);
      doc.text(splitObservacao, 14, yPosition + 50);
    }
  } else {
    // Fallback para caso de usuário único (mantendo compatibilidade)
    doc.text(`Usuário: ${data.usuario?.nome || '-'}`, 14, 40);
    doc.text(`Solicitante: ${adminName}`, 14, 50);
    doc.text(`Refeição: ${data.nome_refeicao || '-'}`, 14, 60);
    doc.text(`Quantidade: ${data.quantidade || '0'}`, 14, 70);
    
    // Preservar a data exata sem conversão de timezone
    const [year, month, day] = data.data_consumo.split('-');
    const dataConsumo = new Date(year, month - 1, day);
    doc.text(`Data de Consumo: ${format(dataConsumo, "EEEE, dd/MM/yyyy", { locale: ptBR })}`, 14, 80);
    
    if (data.observacao) {
      doc.text('Observação:', 14, 90);
      doc.setFontSize(10);
      const splitObservacao = doc.splitTextToSize(data.observacao, 180);
      doc.text(splitObservacao, 14, 100);
    }
  }
  
  doc.save('requisicao-refeicao-extra.pdf');
};

export const generateReportPDF = (meals, dateRange) => {
  const doc = new jsPDF();
  
  doc.setFontSize(16);
  doc.text('Relatório de Refeições Extras', 14, 20);
  
  doc.setFontSize(12);
  doc.text(`Período: ${format(new Date(dateRange.start), "EEEE, dd/MM/yyyy", { locale: ptBR })} a ${format(new Date(dateRange.end), "EEEE, dd/MM/yyyy", { locale: ptBR })}`, 14, 30);
  
  const tableData = meals.map(meal => [
    format(new Date(meal.data_consumo), "EEEE, dd/MM/yyyy", { locale: ptBR }),
    meal.usuarios?.nome || '-',
    meal.refeicoes?.nome || '-',
    meal.quantidade?.toString() || '0',
    `R$ ${meal.valor?.toFixed(2)}` || 'R$ 0,00',
  ]);
  
  // Calcular quantidade total e valor total
  const totalQuantity = meals.reduce((acc, meal) => acc + (meal.quantidade || 0), 0);
  const totalValue = meals.reduce((acc, meal) => acc + (meal.valor || 0), 0);
  
  doc.autoTable({
    startY: 40,
    head: [['Data', 'Usuário', 'Refeição', 'Qtd', 'Valor']],
    body: tableData,
    foot: [['', '', 'Totais:', totalQuantity.toString(), `R$ ${totalValue.toFixed(2)}`]],
    theme: 'grid',
    headStyles: {
      fillColor: [51, 51, 51],
      textColor: [255, 255, 255],
      fontSize: 10
    },
    footStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontSize: 10,
      fontStyle: 'bold'
    }
  });
  
  doc.save('relatorio-refeicoes-extras.pdf');
};