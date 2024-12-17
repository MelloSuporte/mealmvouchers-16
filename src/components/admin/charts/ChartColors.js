export const COLORS = {
  // Cores para nomes exatos do banco
  'Café 04:00 ás 05:00': '#221F26',
  'Café 08:00 ás 08:30': '#ea384c',
  'Almoço': '#2196F3',
  'Jantar': '#4CAF50',
  'Ceia': '#9C27B0',
  'Lanche': '#FF9800',
  'Refeição Extra': '#FEF7CD',
  
  // Cores de fallback (mantidas para compatibilidade)
  CAFE: '#8B4513',
  ALMOCO: '#2196F3',
  LANCHE: '#FF9800',
  JANTAR: '#4CAF50',
  CEIA: '#9C27B0',
  DESJEJUM: '#221F26',
  CAFE_MANHA: '#ea384c',
  EXTRA: '#FEF7CD'
};

// Função para normalizar nomes de refeições
export const normalizeMealName = (name) => {
  if (!name) return 'EXTRA';
  
  // Retorna o nome original se ele existir no objeto COLORS
  if (COLORS[name]) {
    return name;
  }
  
  // Caso contrário, tenta normalizar
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
    'café 04:00 às 05:00': 'Café 04:00 ás 05:00',
    'café 08:00 às 08:30': 'Café 08:00 ás 08:30',
    'refeição extra': 'EXTRA'
  };
  
  const normalized = name.toLowerCase().trim();
  return normalizations[normalized] || name;
};