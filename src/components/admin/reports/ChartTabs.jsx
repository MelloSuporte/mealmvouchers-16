import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WeeklyUsageChart from '../charts/WeeklyUsageChart';
import MealDistributionChart from '../charts/MealDistributionChart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { COLORS } from '../charts/ChartColors';
import { supabase } from '../../../config/supabase';
import { startOfWeek, endOfWeek, format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ChartTabs = () => {
  const { data: weeklyData } = useQuery({
    queryKey: ['weekly-data'],
    queryFn: async () => {
      const startDate = startOfWeek(new Date(), { locale: ptBR });
      const endDate = endOfWeek(new Date(), { locale: ptBR });

      const { data, error } = await supabase
        .from('vw_uso_voucher_detalhado')
        .select('*')
        .gte('usado_em', startDate.toISOString())
        .lte('usado_em', endDate.toISOString())
        .order('usado_em', { ascending: true });

      if (error) throw error;

      // Processar dados para o gráfico semanal
      const processedData = data.reduce((acc, curr) => {
        const dia = format(parseISO(curr.usado_em), 'EEEE', { locale: ptBR });
        const tipo = curr.tipo_refeicao?.toLowerCase() || 'outros';
        
        const existingDay = acc.find(item => item.dia === dia);

        // Função para normalizar os tipos de refeição
        const getTipoNormalizado = (tipo) => {
          const tiposRefeicao = {
            'almoco': ['almoço', 'almoco'],
            'jantar': ['jantar'],
            'cafe': ['café', 'cafe', 'café da manhã', 'cafe da manha'],
            'ceia': ['ceia'],
          };

          for (const [key, valores] of Object.entries(tiposRefeicao)) {
            if (valores.some(valor => tipo.includes(valor))) {
              return key;
            }
          }
          return 'outros';
        };

        const tipoNormalizado = getTipoNormalizado(tipo);

        if (existingDay) {
          existingDay[tipoNormalizado] = (existingDay[tipoNormalizado] || 0) + 1;
          existingDay.total = Object.values(existingDay)
            .filter(value => typeof value === 'number')
            .reduce((sum, value) => sum + value, 0) - existingDay.total;
        } else {
          const newDay = {
            dia,
            almoco: 0,
            jantar: 0,
            cafe: 0,
            ceia: 0,
            outros: 0,
            total: 0
          };
          newDay[tipoNormalizado] = 1;
          newDay.total = 1;
          acc.push(newDay);
        }
        
        return acc;
      }, []);

      // Ordenar os dias da semana
      const diasDaSemana = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
      return processedData.sort((a, b) => {
        return diasDaSemana.indexOf(a.dia.toLowerCase()) - diasDaSemana.indexOf(b.dia.toLowerCase());
      });
    },
    refetchInterval: 30000 // Atualiza a cada 30 segundos
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
