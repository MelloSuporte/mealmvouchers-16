import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, FileDown } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ReportMetrics from './reports/ReportMetrics';
import UsageTable from './reports/UsageTable';
import ChartTabs from './reports/ChartTabs';
import api from '../../utils/api';
import { toast } from "sonner";

const ReportForm = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const exportToPDF = async () => {
    try {
      const response = await api.get('/reports/export');
      const doc = new jsPDF();
      
      // Adiciona título
      doc.setFontSize(16);
      doc.text('Relatório de Uso de Vouchers', 14, 15);
      
      // Configura os dados para a tabela
      const tableData = response.data.map(item => [
        item.code,
        item.user_name || 'N/A',
        item.company_name || 'N/A',
        new Date(item.created_at).toLocaleString(),
        item.used_at ? new Date(item.used_at).toLocaleString() : 'N/A',
        item.used ? 'Sim' : 'Não'
      ]);

      // Adiciona a tabela ao PDF
      autoTable(doc, {
        head: [['Código', 'Usuário', 'Empresa', 'Data Criação', 'Data Uso', 'Utilizado']],
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
            placeholder="Pesquisar..."
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