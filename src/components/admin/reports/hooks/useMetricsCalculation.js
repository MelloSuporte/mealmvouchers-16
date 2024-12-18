import { useMemo } from 'react';

const calculateTotalCost = (data) => {
  return data.reduce((sum, item) => {
    const valor = parseFloat(item.valor || 0);
    return sum + valor;
  }, 0);
};

const calculateAverageCost = (totalCost, totalItems) => {
  return totalItems > 0 ? totalCost / totalItems : 0;
};

const groupByField = (data, field, defaultValue = 'Não especificado') => {
  return data.reduce((acc, curr) => {
    const key = curr[field] || defaultValue;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
};

export const useMetricsCalculation = (usageData) => {
  return useMemo(() => {
    if (!usageData) return null;

    console.log('Calculando métricas com dados:', usageData);

    const totalCost = calculateTotalCost(usageData);
    const averageCost = calculateAverageCost(totalCost, usageData.length);

    const metrics = {
      totalCost,
      averageCost,
      byCompany: groupByField(usageData, 'nome_empresa'),
      byShift: groupByField(usageData, 'turno'),
      byMealType: groupByField(usageData, 'tipo_refeicao'),
      data: usageData
    };

    console.log('Métricas calculadas:', metrics);
    return metrics;
  }, [usageData]);
};