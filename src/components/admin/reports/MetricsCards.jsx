import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MetricsCards = ({ metrics }) => {
  const formatValue = (value) => {
    if (value === undefined || value === null) return '0,00';
    return typeof value === 'number' ? value.toFixed(2).replace('.', ',') : '0,00';
  };

  // Ensure metrics object exists
  const safeMetrics = metrics || {};

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Gasto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            R$ {formatValue(safeMetrics.totalCost)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Custo Médio por Refeição</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            R$ {formatValue(safeMetrics.averageCost)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Refeições</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {safeMetrics.data?.length || 0}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MetricsCards;