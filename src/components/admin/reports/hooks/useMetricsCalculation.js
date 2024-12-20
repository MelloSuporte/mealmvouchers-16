import { useMemo } from 'react';

export const useMetricsCalculation = (data) => {
  return useMemo(() => {
    if (!data || !Array.isArray(data)) {
      console.log('Dados inválidos para cálculo de métricas:', { _type: typeof data, value: data });
      return {
        totalCost: 0,
        averageCost: 0,
        regularVouchers: 0,
        disposableVouchers: 0,
        byCompany: {},
        byShift: {},
        byMealType: {}
      };
    }

    console.log('Calculando métricas com', data.length, 'registros');

    const totalCost = data.reduce((sum, item) => {
      return sum + (parseFloat(item.tipos_refeicao?.valor) || 0);
    }, 0);

    console.log('Custo total calculado:', totalCost);

    const averageCost = data.length > 0 ? totalCost / data.length : 0;

    console.log('Custo médio calculado:', averageCost);

    const byCompany = data.reduce((acc, curr) => {
      const empresa = curr.usuarios?.empresa_id || 'Não especificado';
      acc[empresa] = (acc[empresa] || 0) + 1;
      return acc;
    }, {});

    const byShift = data.reduce((acc, curr) => {
      const turno = curr.usuarios?.turno_id || 'Não especificado';
      acc[turno] = (acc[turno] || 0) + 1;
      return acc;
    }, {});

    const byMealType = data.reduce((acc, curr) => {
      const tipo = curr.tipos_refeicao?.nome || 'Não especificado';
      acc[tipo] = (acc[tipo] || 0) + 1;
      return acc;
    }, {});

    return {
      totalCost,
      averageCost,
      regularVouchers: data.length,
      disposableVouchers: 0,
      byCompany,
      byShift,
      byMealType
    };
  }, [data]);
};