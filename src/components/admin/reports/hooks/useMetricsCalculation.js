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

    // Agrupamento por empresa
    const byCompany = usageData.reduce((acc, curr) => {
      const empresa = curr.nome_empresa || 'Não especificado';
      acc[empresa] = (acc[empresa] || 0) + 1;
      return acc;
    }, {});

    // Agrupamento por turno
    const byShift = usageData.reduce((acc, curr) => {
      const turno = curr.turno || 'Não especificado';
      acc[turno] = (acc[turno] || 0) + 1;
      return acc;
    }, {});

    // Agrupamento por tipo de refeição
    const byMealType = usageData.reduce((acc, curr) => {
      const tipo = curr.tipo_refeicao || 'Não especificado';
      acc[tipo] = (acc[tipo] || 0) + 1;
      return acc;
    }, {});

    console.log('Métricas calculadas:', {
      totalCost,
      averageCost,
      totalItems: usageData.length,
      byCompany,
      byShift,
      byMealType
    });

    return {
      totalCost,
      averageCost,
      byCompany,
      byShift,
      byMealType,
      data: usageData
    };
  }, [usageData]);
};