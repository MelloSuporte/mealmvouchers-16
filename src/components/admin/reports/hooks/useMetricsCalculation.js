import { useMemo } from 'react';

export const useMetricsCalculation = (usageData) => {
  return useMemo(() => {
    if (!usageData) return null;

    const totalCost = usageData.reduce((sum, item) => sum + (parseFloat(item.valor) || 0), 0);
    const regularVouchers = usageData.filter(item => item.tipo_voucher === 'comum').length;
    const disposableVouchers = usageData.filter(item => item.tipo_voucher === 'descartavel').length;

    return {
      totalCost,
      averageCost: usageData.length > 0 ? totalCost / usageData.length : 0,
      regularVouchers,
      disposableVouchers,
      filteredData: usageData
    };
  }, [usageData]);
};