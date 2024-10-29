import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Download, Search, PieChart as PieChartIcon, BarChart as BarChartIcon, LineChart as LineChartIcon } from 'lucide-react';
import * as XLSX from 'xlsx';
import WeeklyUsageChart from './charts/WeeklyUsageChart';
import MealDistributionChart from './charts/MealDistributionChart';
import { COLORS } from './charts/ChartColors';

const ReportForm = () => {
  const [company, setCompany] = useState("");
  const [mealType, setMealType] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("usage");

  // Dados mockados para demonstração
  const usageData = [
    { id: 1, date: "2024-03-20", time: "12:30", userName: "João Silva", company: "Empresa A", mealType: "Almoço", voucherType: "Regular", cost: 25.00 },
    { id: 2, date: "2024-03-20", time: "13:15", userName: "Maria Santos", company: "Empresa B", mealType: "Almoço", voucherType: "Descartável", cost: 25.00 },
    { id: 3, date: "2024-03-20", time: "19:00", userName: "Pedro Costa", company: "Empresa A", mealType: "Jantar", voucherType: "Regular", cost: 25.00 },
  ];

  // Dados para os gráficos
  const weeklyData = [
    { name: 'Segunda', Almoço: 40, Jantar: 24, Café: 15 },
    { name: 'Terça', Almoço: 35, Jantar: 22, Café: 18 },
    { name: 'Quarta', Almoço: 45, Jantar: 25, Café: 20 },
    { name: 'Quinta', Almoço: 38, Jantar: 28, Café: 17 },
    { name: 'Sexta', Almoço: 42, Jantar: 30, Café: 19 },
  ];

  const mealTypeDistribution = [
    { name: 'Almoço', value: 200 },
    { name: 'Jantar', value: 129 },
    { name: 'Café', value: 89 },
  ];

  const trendData = [
    { name: '01/03', total: 150 },
    { name: '02/03', total: 165 },
    { name: '03/03', total: 180 },
    { name: '04/03', total: 170 },
    { name: '05/03', total: 190 },
  ];

  const filteredData = usageData.filter(item =>
    item.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCost = filteredData.reduce((acc, curr) => acc + curr.cost, 0);
  const averageCost = totalCost / filteredData.length || 0;
  const regularVouchers = filteredData.filter(item => item.voucherType === "Regular").length;
  const disposableVouchers = filteredData.filter(item => item.voucherType === "Descartável").length;

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(usageData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Histórico de Uso");
    XLSX.writeFile(wb, "relatorio_vouchers.xlsx");
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

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gasto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalCost.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {averageCost.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vouchers Regulares</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{regularVouchers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vouchers Descartáveis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{disposableVouchers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs para diferentes visualizações */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="usage" className="flex items-center gap-2">
            <BarChartIcon className="h-4 w-4" />
            Uso por Dia
          </TabsTrigger>
          <TabsTrigger value="distribution" className="flex items-center gap-2">
            <PieChartIcon className="h-4 w-4" />
            Distribuição
          </TabsTrigger>
          <TabsTrigger value="trend" className="flex items-center gap-2">
            <LineChartIcon className="h-4 w-4" />
            Tendência
          </TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Uso por Dia da Semana</h3>
          <WeeklyUsageChart data={weeklyData} />
        </TabsContent>

        <TabsContent value="distribution" className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Distribuição por Tipo de Refeição</h3>
          <MealDistributionChart data={mealTypeDistribution} />
        </TabsContent>

        <TabsContent value="trend" className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Tendência de Uso</h3>
          <div className="w-full overflow-x-auto">
            <LineChart width={800} height={300} data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" stroke={COLORS.ALMOCO} />
            </LineChart>
          </div>
        </TabsContent>
      </Tabs>

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
              <TableHead>Custo</TableHead>
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
                <TableCell>R$ {item.cost.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ReportForm;
