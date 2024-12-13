import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WeeklyUsageChart from '../charts/WeeklyUsageChart';
import MealDistributionChart from '../charts/MealDistributionChart';
import TrendChart from './components/TrendChart';
import { useChartData } from './hooks/useChartData';
import { useMealTypes } from './hooks/useMealTypes';

const ChartTabs = () => {
  const { data: tiposRefeicao } = useMealTypes();
  const { weeklyData, distributionData, trendData } = useChartData(tiposRefeicao);

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
        <TrendChart data={trendData || []} />
      </TabsContent>
    </Tabs>
  );
};

export default ChartTabs;