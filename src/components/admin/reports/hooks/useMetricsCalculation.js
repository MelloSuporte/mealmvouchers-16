export const useMetricsCalculation = (usageData) => {
  if (!usageData || !Array.isArray(usageData)) {
    return {
      totalCost: 0,
      averageCost: 0,
      byCompany: {},
      byShift: {},
      byMealType: {},
      data: []
    };
  }

  const totalCost = usageData.reduce((sum, item) => sum + (parseFloat(item.valor) || 0), 0);
  const averageCost = usageData.length > 0 ? totalCost / usageData.length : 0;

  // Agrupar por empresa
  const byCompany = usageData.reduce((acc, curr) => {
    const empresa = curr.nome_empresa || 'Não especificado';
    acc[empresa] = (acc[empresa] || 0) + 1;
    return acc;
  }, {});

  // Agrupar por turno
  const byShift = usageData.reduce((acc, curr) => {
    const turno = curr.turno || 'Não especificado';
    acc[turno] = (acc[turno] || 0) + 1;
    return acc;
  }, {});

  // Agrupar por tipo de refeição
  const byMealType = usageData.reduce((acc, curr) => {
    const tipo = curr.tipo_refeicao || 'Não especificado';
    acc[tipo] = (acc[tipo] || 0) + 1;
    return acc;
  }, {});

  return {
    totalCost,
    averageCost,
    byCompany,
    byShift,
    byMealType,
    data: usageData
  };
};