import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useReportsTData } from './hooks/useReportsTData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ScatterChart, Scatter } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const ReportsTCharts = ({ filters }) => {
  const { data, isLoading } = useReportsTData(filters);

  if (isLoading) {
    return <div className="text-center p-4">Carregando dados...</div>;
  }

  if (!data?.length) {
    return (
      <div className="text-center p-4 text-gray-500">
        Nenhum dado encontrado para o período e filtros selecionados.
        <br />
        Tente ajustar os filtros ou selecione um período diferente.
      </div>
    );
  }

  const usageData = data.map(item => ({
    data: new Date(item.data_uso).toLocaleDateString(),
    total: 1,
    valor: parseFloat(item.valor_refeicao) || 0,
    tipo: item.tipo || 'comum'
  })).reduce((acc, curr) => {
    const existing = acc.find(item => item.data === curr.data);
    if (existing) {
      existing.total += curr.total;
      existing.valor += curr.valor;
    } else {
      acc.push(curr);
    }
    return acc;
  }, []);

  const distributionData = data.reduce((acc, curr) => {
    const tipo = curr.tipo || 'comum';
    const existing = acc.find(item => item.name === tipo);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: tipo, value: 1 });
    }
    return acc;
  }, []);

  const trendData = data.map((item, index) => ({
    x: index,
    y: parseFloat(item.valor_refeicao) || 0,
    data: new Date(item.data_uso).toLocaleDateString(),
    tipo: item.tipo || 'comum'
  }));

  return (
    <Tabs defaultValue="usage" className="w-full">
      <TabsList>
        <TabsTrigger value="usage">Uso por Dia</TabsTrigger>
        <TabsTrigger value="distribution">Distribuição</TabsTrigger>
        <TabsTrigger value="trend">Tendência</TabsTrigger>
      </TabsList>

      <TabsContent value="usage" className="h-[400px]">
        <ResponsiveContainer>
          <LineChart data={usageData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="data" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="total" stroke="#8884d8" name="Total de Usos" />
            <Line yAxisId="right" type="monotone" dataKey="valor" stroke="#82ca9d" name="Valor Total (R$)" />
          </LineChart>
        </ResponsiveContainer>
      </TabsContent>

      <TabsContent value="distribution" className="h-[400px]">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={distributionData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={150}
              label={({ name, value }) => `${name}: ${value}`}
            >
              {distributionData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </TabsContent>

      <TabsContent value="trend" className="h-[400px]">
        <ResponsiveContainer>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="x" name="Dia" />
            <YAxis dataKey="y" name="Valor (R$)" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter name="Valores" data={trendData} fill="#8884d8" />
          </ScatterChart>
        </ResponsiveContainer>
      </TabsContent>
    </Tabs>
  );
};

export default ReportsTCharts;