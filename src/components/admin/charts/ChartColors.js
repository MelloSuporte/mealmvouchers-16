export const COLORS = {
  CAFE: '#8B4513',      // Marrom para Café da Manhã
  ALMOCO: '#2196F3',    // Azul para Almoço
  LANCHE: '#FF9800',    // Laranja para Lanche
  JANTAR: '#4CAF50',    // Verde para Jantar
  CEIA: '#9C27B0',      // Roxo para Ceia
  DESJEJUM: '#8B4513',  // Marrom (mesmo do café)
  EXTRA: '#FF9800',     // Laranja (mesmo do lanche)
  // Cores adicionais para outros tipos de visualizações
  PRIMARY: '#2196F3',   // Azul primário (mesmo do almoço)
  SECONDARY: '#4CAF50', // Verde secundário (mesmo do jantar)
  SUCCESS: '#8B4513',   // Marrom (mesmo do café)
  WARNING: '#FF9800',   // Laranja (mesmo do lanche)
  INFO: '#9C27B0'       // Roxo (mesmo da ceia)
};

// Exporta arrays de cores para diferentes tipos de gráficos
export const getChartColors = () => [COLORS.ALMOCO, COLORS.JANTAR, COLORS.CAFE, COLORS.LANCHE, COLORS.CEIA];
export const getLineColors = () => [COLORS.ALMOCO, COLORS.JANTAR, COLORS.CAFE];
export const getBarColors = () => [COLORS.ALMOCO, COLORS.JANTAR, COLORS.CAFE, COLORS.LANCHE, COLORS.CEIA];

// Função para normalizar nomes de refeições
export const normalizeMealName = (name) => {
  const normalizations = {
    'café': 'CAFE',
    'cafe': 'CAFE',
    'café (1)': 'CAFE',
    'café (2)': 'CAFE',
    'almoco': 'ALMOCO',
    'almoço': 'ALMOCO',
    'lanche': 'LANCHE',
    'jantar': 'JANTAR',
    'ceia': 'CEIA',
    'desjejum': 'DESJEJUM',
    'extra': 'EXTRA'
  };
  
  const normalized = name.toLowerCase().trim();
  return normalizations[normalized] || normalized.toUpperCase();
};