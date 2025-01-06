import React from 'react';
import { Button } from "@/components/ui/button";
import { FileDown, Printer } from "lucide-react";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from "@/components/ui/use-toast";

const PresentationPDF = () => {
  const { toast } = useToast();

  const generatePDF = async () => {
    try {
      toast({
        title: "Gerando PDF",
        description: "Por favor, aguarde enquanto geramos a apresentação...",
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Configurações do PDF
      pdf.setFont("helvetica");
      pdf.setFontSize(20);
      
      // Capa
      pdf.text("Sistema de Vouchers para Refeitório", 20, 30);
      pdf.setFontSize(14);
      pdf.text("Apresentação para Diretoria", 20, 45);
      pdf.text(new Date().toLocaleDateString('pt-BR'), 20, 55);
      
      // Índice
      pdf.addPage();
      pdf.setFontSize(16);
      pdf.text("Índice", 20, 30);
      pdf.setFontSize(12);
      pdf.text("1. Visão Geral", 20, 50);
      pdf.text("2. Benefícios", 20, 60);
      pdf.text("3. Funcionalidades Principais", 20, 70);
      pdf.text("4. Métricas e Resultados", 20, 80);
      pdf.text("5. Próximos Passos", 20, 90);

      // Visão Geral
      pdf.addPage();
      pdf.setFontSize(16);
      pdf.text("1. Visão Geral", 20, 30);
      pdf.setFontSize(12);
      pdf.text([
        "O Sistema de Vouchers para Refeitório é uma solução completa para",
        "gestão e controle de acesso ao refeitório, oferecendo:",
        "",
        "• Controle digital de acessos",
        "• Diferentes tipos de vouchers",
        "• Gestão em tempo real",
        "• Relatórios detalhados",
        "• Integração com sistemas existentes"
      ], 20, 50);

      // Benefícios
      pdf.addPage();
      pdf.setFontSize(16);
      pdf.text("2. Benefícios", 20, 30);
      pdf.setFontSize(12);
      
      // Benefícios Financeiros
      pdf.text("Benefícios Financeiros:", 20, 50);
      pdf.text([
        "• Redução de custos operacionais",
        "• Controle efetivo de gastos",
        "• Prevenção de fraudes",
        "• Otimização de recursos"
      ], 25, 60);
      
      // Benefícios Operacionais
      pdf.text("Benefícios Operacionais:", 20, 90);
      pdf.text([
        "• Automatização de processos",
        "• Redução de erros",
        "• Maior agilidade",
        "• Melhor controle"
      ], 25, 100);

      // Capturar telas do sistema
      const screens = document.querySelectorAll('.screen-capture');
      for (let i = 0; i < screens.length; i++) {
        const canvas = await html2canvas(screens[i]);
        const imgData = canvas.toDataURL('image/png');
        
        pdf.addPage();
        pdf.setFontSize(14);
        pdf.text(`Tela ${i + 1}`, 20, 30);
        
        const imgWidth = 170;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 20, 40, imgWidth, imgHeight);
      }

      // Salvar PDF
      pdf.save('apresentacao-sistema-vouchers.pdf');

      toast({
        title: "PDF Gerado com Sucesso",
        description: "A apresentação foi gerada e baixada automaticamente.",
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro ao Gerar PDF",
        description: "Ocorreu um erro ao gerar a apresentação. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex gap-4">
      <Button onClick={generatePDF} className="flex items-center gap-2">
        <FileDown className="h-4 w-4" />
        Gerar PDF
      </Button>
      <Button
        onClick={() => window.print()}
        variant="outline"
        className="flex items-center gap-2"
      >
        <Printer className="h-4 w-4" />
        Imprimir
      </Button>
    </div>
  );
};

export default PresentationPDF;