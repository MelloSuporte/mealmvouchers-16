import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WeeklyUsageChart from '../charts/WeeklyUsageChart';
import MealDistributionChart from '../charts/MealDistributionChart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { COLORS } from '../charts/ChartColors';
import { supabase } from '../../../config/supabase';

const ChartTabs = () => {
  const { data: weeklyData } = useQuery({
    queryKey: ['weekly-data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vw_uso_voucher_detalhado')
        .select('*')
        .order('usado_em', { ascending: true });

      if (error) throw error;

      // Processar dados para o gráfico semanal
      const processedData = data.reduce((acc, curr) => {
        const dia = new Date(curr.usado_em).toLocaleDateString('pt-BR');
        const tipo = curr.tipo_refeicao?.toLowerCase() || 'outros';
        
        const existingDay = acc.find(item => item.dia === dia);
        if (existingDay) {
          existingDay[tipo] = (existingDay[tipo] || 0) + 1;
        } else {
          acc.push({
            dia,
            almoco: tipo === 'almoco' ? 1 : 0,
            jantar: tipo === 'jantar' ? 1 : 0,
            cafe: tipo === 'cafe' ? 1 : 0
          });
        }
        return acc;
      }, []);

      return processedData;
    }
  });

  const { data: distributionData } = useQuery({
    queryKey: ['distribution-data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vw_uso_voucher_detalhado')
        .select('tipo_refeicao');

      if (error) throw error;

      // Processar dados para o gráfico de pizza
      const distribution = data.reduce((acc, curr) => {
        const tipo = curr.tipo_refeicao || 'Não especificado';
        acc[tipo] = (acc[tipo] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(distribution).map(([nome, valor]) => ({
        nome,
        valor
      }));
    }
  });

  const { data: trendData } = useQuery({
    queryKey: ['trend-data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vw_uso_voucher_detalhado')
        .select('usado_em')
        .order('usado_em', { ascending: true });

      if (error) throw error;

      // Processar dados para o gráfico de tendência
      const trend = data.reduce((acc, curr) => {
        const dia = new Date(curr.usado_em).toLocaleDateString('pt-BR');
        acc[dia] = (acc[dia] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(trend).map(([dia, total]) => ({
        dia,
        total
      }));
    }
  });

  return (
    <Tabs defaultValue="usage" className="w-full">
      <TabsList className="w-full justify-start">
        <TabsTrigger value="usage">Uso por Dia</TabsTrigger>
        <TabsTrigger value="distribution">Distribuição</TabsTrigger>
        <TabsTrigger value="trend">Tendência</TabsTrigger>
      </TabsList>

      <TabsContent value="usage" className="mt-4">
        <WeeklyUsageChart data={weeklyData || []} />
      </TabsContent>

      <TabsContent value="distribution" className="mt-4">
        <MealDistributionChart data={distributionData || []} />
      </TabsContent>

      <TabsContent value="trend" className="mt-4">
        <div className="w-full h-[300px]">
          <ResponsiveContainer>
            <LineChart data={trendData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dia" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" name="Total de Usos" stroke={COLORS.ALMOCO} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default ChartTabs;