export const COLORS = {
  CAFE: '#8B4513',      // Marrom para Café da Manhã
  ALMOCO: '#2196F3',    // Azul para Almoço
  LANCHE: '#FF9800',    // Laranja para Lanche
  JANTAR: '#4CAF50',    // Verde para Jantar
  CEIA: '#9C27B0',      // Roxo para Ceia
  DESJEJUM: '#221F26',  // Marrom escuro para Café 04:00 às 05:00
  CAFE_MANHA: '#ea384c', // Vermelho para Café 08:00 às 08:30
  EXTRA: '#FEF7CD',     // Amarelo suave para Refeição Extra
  'Café 04:00 ás 05:00': '#221F26',
  'Café 08:00 ás 08:30': '#ea384c',
  'Almoço': '#2196F3',
  'Jantar': '#4CAF50',
  'Ceia': '#9C27B0',
  'Lanche': '#FF9800',
  'Refeição Extra': '#FEF7CD'
};

// Função para normalizar nomes de refeições
export const normalizeMealName = (name) => {
  if (!name) return 'EXTRA';
  
  // Mapeamento direto para nomes exatos do banco
  const exactMatches = {
    'Café 04:00 ás 05:00': 'Café 04:00 ás 05:00',
    'Café 08:00 ás 08:30': 'Café 08:00 ás 08:30',
    'Almoço': 'Almoço',
    'Jantar': 'Jantar',
    'Ceia': 'Ceia',
    'Lanche': 'Lanche',
    'Refeição Extra': 'Refeição Extra'
  };

  // Primeiro tenta encontrar uma correspondência exata
  if (exactMatches[name]) {
    return exactMatches[name];
  }

  // Se não encontrar correspondência exata, normaliza o nome
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
    'café 08:00 às 08:30': 'CAFE_MANHA',
    'refeição extra': 'EXTRA'
  };
  
  const normalized = name.toLowerCase().trim();
  return normalizations[normalized] || name;
};