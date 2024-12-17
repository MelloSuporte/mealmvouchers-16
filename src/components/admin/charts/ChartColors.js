export const COLORS = {
  CAFE: '#ea384c',     // Vermelho para Café 08:00 às 08:30
  ALMOCO: '#2196F3',   // Mantendo Azul para Almoço
  LANCHE: '#FF9800',   // Mantendo Laranja para Lanche
  JANTAR: '#4CAF50',   // Mantendo Verde para Jantar
  CEIA: '#9C27B0',     // Mantendo Roxo para Ceia
  DESJEJUM: '#221F26', // Marrom escuro para Café 04:00 às 05:00
  EXTRA: '#FEF7CD',    // Amarelo suave para Refeição Extra
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