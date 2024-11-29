import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, FileDown } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ReportMetrics from './reports/ReportMetrics';
import UsageTable from './reports/UsageTable';
import ChartTabs from './reports/ChartTabs';
import { supabase } from '../../config/supabase';
import { toast } from "sonner";

const ReportForm = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const exportToPDF = async () => {
    try {
      const { data, error } = await supabase
        .from('vw_uso_voucher_detalhado')
        .select('*')
        .order('usado_em', { ascending: false });

      if (error) throw error;

      const doc = new jsPDF();
      
      // Adiciona título
      doc.setFontSize(16);
      doc.text('Relatório de Uso de Vouchers', 14, 15);
      
      // Configura os dados para a tabela
      const tableData = data.map(item => [
        new Date(item.usado_em).toLocaleString('pt-BR'),
        item.nome_usuario || 'N/A',
        item.cpf || 'N/A',
        item.voucher || 'N/A',
        item.empresa || 'N/A',
        item.tipo_refeicao || 'N/A',
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor_refeicao),
        item.turno || 'N/A'
      ]);

      // Adiciona a tabela ao PDF
      autoTable(doc, {
        head: [['Data/Hora', 'Usuário', 'CPF', 'Voucher', 'Empresa', 'Refeição', 'Valor', 'Turno']],
        body: tableData,
        startY: 25,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [41, 128, 185] }
      });

      // Salva o PDF
      doc.save('relatorio_vouchers.pdf');
      toast.success('PDF gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      toast.error('Erro ao gerar PDF');
    }
  };

  return (
    <div className="space-y-6">
      <ReportMetrics />
      
      <ChartTabs />

      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button onClick={exportToPDF}>
          <FileDown className="mr-2 h-4 w-4" />
          Exportar PDF
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <UsageTable searchTerm={searchTerm} />
      </div>
    </div>
  );
};

export default ReportForm;