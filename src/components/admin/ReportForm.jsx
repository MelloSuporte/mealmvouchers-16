import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import ReportMetrics from './reports/ReportMetrics';
import UsageTable from './reports/UsageTable';
import ChartTabs from './reports/ChartTabs';
import api from '../../utils/api';

const ReportForm = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const exportToExcel = async () => {
    try {
      const response = await api.get('/reports/export');
      const ws = XLSX.utils.json_to_sheet(response.data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Histórico de Uso");
      XLSX.writeFile(wb, "relatorio_vouchers.xlsx");
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
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
        <Button onClick={exportToExcel}>
          <Download className="mr-2 h-4 w-4" />
          Exportar Excel
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <UsageTable searchTerm={searchTerm} />
      </div>
    </div>
  );
};

export default ReportForm;