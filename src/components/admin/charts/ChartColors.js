export const COLORS = {
  CAFE: '#8B4513',      // Marrom para Café da Manhã
  ALMOCO: '#2196F3',    // Azul para Almoço
  LANCHE: '#FF9800',    // Laranja para Lanche
  JANTAR: '#4CAF50',    // Verde para Jantar
  CEIA: '#9C27B0',      // Roxo para Ceia
  DESJEJUM: '#221F26',  // Marrom escuro para Café 04:00 às 05:00
  CAFE_MANHA: '#ea384c', // Vermelho para Café 08:00 às 08:30
  EXTRA: '#FEF7CD',     // Amarelo suave para Refeição Extra
};

// Função para normalizar nomes de refeições
export const normalizeMealName = (name) => {
  if (!name) return 'EXTRA';
  
  const normalizations = {
    'café': 'CAFE',
    'cafe': 'CAFE',
    'café da manhã': 'CAFE_MANHA',
    'café (1)': 'CAFE',
    'café (2)': 'CAFE',
    'almoco': 'ALMOCO',
    'almoço': 'ALMOCO',
    'lanche': 'LANCHE',
    'jantar': 'JANTAR',
    'ceia': 'CEIA',
    'desjejum': 'DESJEJUM',
    'extra': 'EXTRA',
    'café 04:00 às 05:00': 'DESJEJUM',
    'café 08:00 às 08:30': 'CAFE_MANHA'
  };
  
  const normalized = name.toLowerCase().trim();
  return normalizations[normalized] || normalized.toUpperCase();
};