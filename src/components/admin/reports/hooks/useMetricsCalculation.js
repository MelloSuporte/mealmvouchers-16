import { useMemo } from 'react';

export const useMetricsCalculation = (data = []) => {
  return useMemo(() => {
    console.log('Calculando métricas com dados:', data);

    if (!Array.isArray(data) || data.length === 0) {
      console.log('Métricas calculadas:', {
        totalCost: 0,
        averageCost: 0,
        byCompany: {},
        byShift: {},
        byMealType: {},
        data: []
      });
      
      return {
        totalCost: 0,
        averageCost: 0,
        byCompany: {},
        byShift: {},
        byMealType: {},
        data: []
      };
    }

    const totalCost = data.reduce((sum, item) => {
      const valor = parseFloat(item.valor_refeicao || 0);
      return sum + (isNaN(valor) ? 0 : valor);
    }, 0);

    const averageCost = totalCost / data.length;

    const byCompany = data.reduce((acc, curr) => {
      const empresa = curr.nome_empresa || 'Não especificado';
      acc[empresa] = (acc[empresa] || 0) + 1;
      return acc;
    }, {});

    const byShift = data.reduce((acc, curr) => {
      const turno = curr.turno || 'Não especificado';
      acc[turno] = (acc[turno] || 0) + 1;
      return acc;
    }, {});

    const byMealType = data.reduce((acc, curr) => {
      const tipo = curr.tipo_refeicao || 'Não especificado';
      acc[tipo] = (acc[tipo] || 0) + 1;
      return acc;
    }, {});

    const result = {
      totalCost,
      averageCost,
      byCompany,
      byShift,
      byMealType,
      data
    };

    console.log('Métricas calculadas:', result);
    return result;
  }, [data]);
};