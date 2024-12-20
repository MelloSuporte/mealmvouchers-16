import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReportMetrics from './reports/ReportMetrics';
import ChartTabs from './reports/ChartTabs';
import LogsSection from './reports/LogsSection';

const ReportForm = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="metrics">
        <TabsList>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
          <TabsTrigger value="charts">Gráficos</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="metrics">
          <ReportMetrics />
        </TabsContent>
        
        <TabsContent value="charts">
          <ChartTabs />
        </TabsContent>
        
        <TabsContent value="logs">
          <LogsSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportForm;