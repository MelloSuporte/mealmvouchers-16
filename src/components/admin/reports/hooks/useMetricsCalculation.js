import { useMemo } from 'react';

export const useMetricsCalculation = (usageData) => {
  return useMemo(() => {
    if (!usageData) return null;

    console.log('Calculando métricas com dados:', usageData);

    const totalCost = usageData.reduce((sum, item) => {
      const valor = parseFloat(item.valor || 0);
      return sum + valor;
    }, 0);
    
    const averageCost = usageData.length > 0 ? totalCost / usageData.length : 0;

    console.log('Métricas calculadas:', {
      totalCost,
      averageCost,
      totalItems: usageData.length
    });

    return {
      totalCost,
      averageCost,
      data: usageData
    };
  }, [usageData]);
};