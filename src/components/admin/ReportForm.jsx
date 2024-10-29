import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Download, Search } from 'lucide-react';
import * as XLSX from 'xlsx';

const ReportForm = () => {
  const [company, setCompany] = useState("");
  const [mealType, setMealType] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");

  // Dados mockados para demonstração
  const usageData = [
    { id: 1, date: "2024-03-20", time: "12:30", userName: "João Silva", company: "Empresa A", mealType: "Almoço", voucherType: "Regular" },
    { id: 2, date: "2024-03-20", time: "13:15", userName: "Maria Santos", company: "Empresa B", mealType: "Almoço", voucherType: "Descartável" },
    { id: 3, date: "2024-03-20", time: "19:00", userName: "Pedro Costa", company: "Empresa A", mealType: "Jantar", voucherType: "Regular" },
    // Adicione mais dados conforme necessário
  ];

  // Dados para o gráfico
  const chartData = [
    { name: 'Segunda', Almoço: 40, Jantar: 24, Café: 15 },
    { name: 'Terça', Almoço: 35, Jantar: 22, Café: 18 },
    { name: 'Quarta', Almoço: 45, Jantar: 25, Café: 20 },
    { name: 'Quinta', Almoço: 38, Jantar: 28, Café: 17 },
    { name: 'Sexta', Almoço: 42, Jantar: 30, Café: 19 },
  ];

  const filteredData = usageData.filter(item =>
    item.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(usageData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Histórico de Uso");
    XLSX.writeFile(wb, "historico_uso_vouchers.xlsx");
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Select value={company} onValueChange={setCompany}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a empresa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="empresa-a">Empresa A</SelectItem>
            <SelectItem value="empresa-b">Empresa B</SelectItem>
          </SelectContent>
        </Select>

        <Select value={mealType} onValueChange={setMealType}>
          <SelectTrigger>
            <SelectValue placeholder="Tipo de refeição" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="almoco">Almoço</SelectItem>
            <SelectItem value="cafe">Café</SelectItem>
            <SelectItem value="jantar">Jantar</SelectItem>
          </SelectContent>
        </Select>

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

      {/* Barra de pesquisa e botão de exportação */}
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

      {/* Gráfico de uso */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Uso por Dia da Semana</h3>
        <div className="w-full overflow-x-auto">
          <BarChart width={800} height={300} data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Almoço" fill="#8884d8" />
            <Bar dataKey="Jantar" fill="#82ca9d" />
            <Bar dataKey="Café" fill="#ffc658" />
          </BarChart>
        </div>
      </div>

      {/* Tabela de histórico */}
      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Hora</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Refeição</TableHead>
              <TableHead>Tipo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.date}</TableCell>
                <TableCell>{item.time}</TableCell>
                <TableCell>{item.userName}</TableCell>
                <TableCell>{item.company}</TableCell>
                <TableCell>{item.mealType}</TableCell>
                <TableCell>{item.voucherType}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ReportForm;