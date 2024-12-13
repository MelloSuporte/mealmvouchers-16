import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WeeklyUsageChart from '../charts/WeeklyUsageChart';
import MealDistributionChart from '../charts/MealDistributionChart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { COLORS } from '../charts/ChartColors';
import { supabase } from '../../../config/supabase';
import { startOfWeek, endOfWeek, format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from "sonner";

const ChartTabs = () => {
  const { data: tiposRefeicao } = useQuery({
    queryKey: ['tipos-refeicao'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tipos_refeicao')
        .select('nome')
        .eq('ativo', true);

      if (error) {
        console.error('Erro ao buscar tipos de refeição:', error);
        toast.error('Erro ao carregar tipos de refeição');
        throw error;
      }
      
      console.log('Tipos de refeição carregados:', data);
      return data?.map(tipo => tipo.nome) || [];
    }
  });

  const { data: weeklyData } = useQuery({
    queryKey: ['weekly-data'],
    queryFn: async () => {
      const startDate = startOfWeek(new Date(), { locale: ptBR });
      const endDate = endOfWeek(new Date(), { locale: ptBR });

      console.log('Buscando dados semanais de:', startDate, 'até:', endDate);

      const { data, error } = await supabase
        .from('vw_uso_voucher_detalhado')
        .select('*')
        .gte('data_uso', startDate.toISOString())
        .lte('data_uso', endDate.toISOString());

      if (error) {
        console.error('Erro ao buscar dados semanais:', error);
        toast.error('Erro ao carregar dados semanais');
        throw error;
      }

      console.log('Dados semanais brutos:', data);

      // Inicializa os dias da semana
      const diasDaSemana = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
      
      // Cria objeto inicial com contadores zerados para cada dia
      const dadosPorDia = diasDaSemana.map(dia => {
        const diaObj = { dia };
        if (tiposRefeicao) {
          tiposRefeicao.forEach(tipo => {
            diaObj[tipo] = 0;
          });
        }
        return diaObj;
      });

      // Processa os dados retornados da query
      if (data && data.length > 0) {
        data.forEach(registro => {
          if (registro.data_uso && registro.tipo_refeicao) {
            const dataUso = new Date(registro.data_uso);
            const diaSemana = format(dataUso, 'EEEE', { locale: ptBR });
            const indexDia = diasDaSemana.indexOf(diaSemana);
            
            if (indexDia !== -1) {
              dadosPorDia[indexDia][registro.tipo_refeicao] = 
                (dadosPorDia[indexDia][registro.tipo_refeicao] || 0) + 1;
            }
          }
        });
      }

      console.log('Dados semanais processados:', dadosPorDia);
      return dadosPorDia;
    },
    enabled: !!tiposRefeicao
  });

  const { data: distributionData } = useQuery({
    queryKey: ['distribution-data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vw_uso_voucher_detalhado')
        .select('tipo_refeicao')
        .gte('data_uso', subDays(new Date(), 30).toISOString());

      if (error) {
        console.error('Erro ao buscar distribuição:', error);
        toast.error('Erro ao carregar distribuição de refeições');
        throw error;
      }

      console.log('Dados de distribuição brutos:', data);

      // Processar dados para o gráfico de pizza
      const distribution = data.reduce((acc, curr) => {
        const tipo = curr.tipo_refeicao || 'Não especificado';
        acc[tipo] = (acc[tipo] || 0) + 1;
        return acc;
      }, {});

      const chartData = Object.entries(distribution).map(([nome, valor]) => ({
        nome,
        valor
      }));

      console.log('Dados de distribuição processados:', chartData);
      return chartData;
    }
  });

  const { data: trendData } = useQuery({
    queryKey: ['trend-data'],
    queryFn: async () => {
      const startDate = subDays(new Date(), 30);
      
      const { data, error } = await supabase
        .from('vw_uso_voucher_detalhado')
        .select('data_uso')
        .gte('data_uso', startDate.toISOString())
        .order('data_uso', { ascending: true });

      if (error) {
        console.error('Erro ao buscar tendência:', error);
        toast.error('Erro ao carregar tendência de uso');
        throw error;
      }

      console.log('Dados de tendência brutos:', data);

      // Processar dados para o gráfico de tendência
      const trend = data.reduce((acc, curr) => {
        const dia = format(new Date(curr.data_uso), 'dd/MM', { locale: ptBR });
        acc[dia] = (acc[dia] || 0) + 1;
        return acc;
      }, {});

      const chartData = Object.entries(trend).map(([dia, total]) => ({
        dia,
        total
      }));

      console.log('Dados de tendência processados:', chartData);
      return chartData;
    }
  });

  if (!tiposRefeicao?.length) {
    return (
      <div className="w-full p-4 text-center text-gray-500">
        Carregando dados...
      </div>
    );
  }

  return (
    <Tabs defaultValue="usage" className="w-full">
      <TabsList className="w-full justify-start">
        <TabsTrigger value="usage">Uso por Dia</TabsTrigger>
        <TabsTrigger value="distribution">Distribuição</TabsTrigger>
        <TabsTrigger value="trend">Tendência</TabsTrigger>
      </TabsList>

      <TabsContent value="usage" className="mt-4">
        <WeeklyUsageChart data={weeklyData || []} tiposRefeicao={tiposRefeicao} />
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
              <Line 
                type="monotone" 
                dataKey="total" 
                name="Total de Usos" 
                stroke={COLORS.ALMOCO} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default ChartTabs;