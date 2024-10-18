import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from "sonner";
import * as XLSX from 'xlsx';

const ReportForm = () => {
  const [company, setCompany] = useState("");
  const [mealType, setMealType] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [reportType, setReportType] = useState("daily");

  const generateReport = () => {
    // Aqui você implementaria a lógica para buscar os dados do relatório
    // Por enquanto, vamos usar dados mockados
    const mockData = [
      { userName: "João Silva", mealDate: "2023-03-01", mealTime: "12:30", company: "Empresa A", mealType: "Almoço", quantity: 1 },
      { userName: "Maria Santos", mealDate: "2023-03-01", mealTime: "13:00", company: "Empresa B", mealType: "Almoço", quantity: 1 },
      // ... mais dados mockados
    ];

    // Gerar o arquivo Excel
    const ws = XLSX.utils.json_to_sheet(mockData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Relatório");
    XLSX.writeFile(wb, "relatorio_refeicoes.xlsx");

    toast.success("Relatório gerado com sucesso!");
  };

  return (
    <div className="space-y-4">
      <Select value={company} onValueChange={setCompany}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione a empresa" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="empresa-a">Empresa A</SelectItem>
          <SelectItem value="empresa-b">Empresa B</SelectItem>
          {/* Adicione mais empresas conforme necessário */}
        </SelectContent>
      </Select>

      <Select value={mealType} onValueChange={setMealType}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione o tipo de refeição" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="almoco">Almoço</SelectItem>
          <SelectItem value="cafe">Café</SelectItem>
          <SelectItem value="lanche">Lanche</SelectItem>
          <SelectItem value="jantar">Jantar</SelectItem>
          <SelectItem value="ceia">Ceia</SelectItem>
          <SelectItem value="extra">Extra</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex space-x-4">
        <DatePicker
          selected={startDate}
          onSelect={setStartDate}
          placeholderText="Data inicial"
        />
        <DatePicker
          selected={endDate}
          onSelect={setEndDate}
          placeholderText="Data final"
        />
      </div>

      <Select value={reportType} onValueChange={setReportType}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione o tipo de relatório" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="daily">Diário</SelectItem>
          <SelectItem value="weekly">Semanal</SelectItem>
          <SelectItem value="monthly">Mensal</SelectItem>
        </SelectContent>
      </Select>

      <Button onClick={generateReport}>Gerar Relatório</Button>
    </div>
  );
};

export default ReportForm;