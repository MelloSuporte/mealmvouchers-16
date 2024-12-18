export const useMetricsCalculation = (usageData) => {
  if (!usageData || !Array.isArray(usageData)) {
    return {
      totalCost: 0,
      averageCost: 0,
      data: []
    };
  }

  const totalCost = usageData.reduce((sum, item) => sum + (parseFloat(item.valor) || 0), 0);
  const averageCost = usageData.length > 0 ? totalCost / usageData.length : 0;

  return {
    totalCost,
    averageCost,
    data: usageData
  };
};