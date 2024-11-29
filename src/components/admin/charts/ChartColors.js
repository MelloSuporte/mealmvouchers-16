export const COLORS = {
  CAFE: '#8B4513',      // Marrom para Café da Manhã
  ALMOCO: '#2196F3',    // Azul para Almoço
  LANCHE: '#FF9800',    // Laranja para Lanche
  JANTAR: '#4CAF50',    // Verde para Jantar
  CEIA: '#9C27B0',      // Roxo para Ceia
  // Cores adicionais para outros tipos de visualizações
  PRIMARY: '#2196F3',   // Azul primário (mesmo do almoço)
  SECONDARY: '#4CAF50', // Verde secundário (mesmo do jantar)
  SUCCESS: '#8B4513',   // Marrom (mesmo do café)
  WARNING: '#FF9800',   // Laranja (mesmo do lanche)
  INFO: '#9C27B0'       // Roxo (mesmo da ceia)
};

// Exporta arrays de cores para diferentes tipos de gráficos
export const getChartColors = () => Object.values(COLORS);
export const getLineColors = () => [COLORS.PRIMARY, COLORS.SECONDARY, COLORS.SUCCESS];
export const getBarColors = () => [COLORS.ALMOCO, COLORS.JANTAR, COLORS.CAFE, COLORS.LANCHE, COLORS.CEIA];