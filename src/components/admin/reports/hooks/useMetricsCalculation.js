import { useMemo } from 'react';

export const useMetricsCalculation = (usageData) => {
  return useMemo(() => {
    if (!usageData) return null;

    const totalCost = usageData.reduce((sum, item) => sum + (parseFloat(item.valor) || 0), 0);
    
    return {
      totalCost,
      averageCost: usageData.length > 0 ? totalCost / usageData.length : 0,
      data: usageData
    };
  }, [usageData]);
};