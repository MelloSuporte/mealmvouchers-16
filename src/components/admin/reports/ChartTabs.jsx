import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WeeklyUsageChart from '../charts/WeeklyUsageChart';
import MealDistributionChart from '../charts/MealDistributionChart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { COLORS } from '../charts/ChartColors';
import api from '../../../utils/api';

const ChartTabs = () => {
  const { data: weeklyData } = useQuery({
    queryKey: ['weekly-data'],
    queryFn: async () => {
      const response = await api.get('/reports/weekly');
      return response.data;
    }
  });

  const { data: distributionData } = useQuery({
    queryKey: ['distribution-data'],
    queryFn: async () => {
      const response = await api.get('/reports/distribution');
      return response.data;
    }
  });

  const { data: trendData } = useQuery({
    queryKey: ['trend-data'],
    queryFn: async () => {
      const response = await api.get('/reports/trend');
      return response.data;
    }
  });

  return (
    <Tabs defaultValue="usage">
      <TabsList>
        <TabsTrigger value="usage">Uso por Dia</TabsTrigger>
        <TabsTrigger value="distribution">Distribuição</TabsTrigger>
        <TabsTrigger value="trend">Tendência</TabsTrigger>
      </TabsList>

      <TabsContent value="usage">
        <WeeklyUsageChart data={weeklyData || []} />
      </TabsContent>

      <TabsContent value="distribution">
        <MealDistributionChart data={distributionData || []} />
      </TabsContent>

      <TabsContent value="trend">
        <div className="w-full overflow-x-auto">
          <LineChart width={800} height={300} data={trendData || []}>
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
  );
};

export default ChartTabs;