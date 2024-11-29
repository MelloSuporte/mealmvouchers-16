export const COLORS = {
  CAFE: '#8B4513',      // Marrom para Café da Manhã
  ALMOCO: '#2196F3',    // Azul para Almoço
  LANCHE: '#FF9800',    // Laranja para Lanche
  JANTAR: '#4CAF50',    // Verde para Jantar
  CEIA: '#9C27B0',      // Roxo para Ceia
  DESJEJUM: '#8B4513',  // Marrom (mesmo do café)
  EXTRA: '#FF9800',     // Laranja (mesmo do lanche)
};

// Função para normalizar nomes de refeições
export const normalizeMealName = (name) => {
  if (!name) return 'EXTRA';
  
  const normalizations = {
    'café': 'CAFE',
    'cafe': 'CAFE',
    'café da manhã': 'CAFE',
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