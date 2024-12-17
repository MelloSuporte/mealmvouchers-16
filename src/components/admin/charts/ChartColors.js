export const COLORS = {
  'Almoço': '#10b981',
  'Jantar': '#6366f1',
  'Lanche': '#f59e0b',
  'Café 04:00 ás 05:00': '#221F26',
  'Café 06:00 ás 06:30': '#854d0e',
  'Café 08:00 ás 08:30': '#ea384c',
  'Ceia': '#7c3aed',
  'Refeição Extra': '#ef4444',
  'EXTRA': '#94a3b8'
};

export const normalizeMealName = (mealName) => {
  // Map common variations of meal names to their standardized versions
  const normalizedNames = {
    'almoco': 'Almoço',
    'almoço': 'Almoço',
    'jantar': 'Jantar',
    'lanche': 'Lanche',
    'cafe_04': 'Café 04:00 ás 05:00',
    'cafe_06': 'Café 06:00 ás 06:30',
    'cafe_08': 'Café 08:00 ás 08:30',
    'ceia': 'Ceia',
    'refeicao_extra': 'Refeição Extra',
    'refeição_extra': 'Refeição Extra',
    'extra': 'EXTRA'
  };

  // Convert to lowercase and remove accents for comparison
  const normalized = mealName.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  // Return the mapped name if it exists, otherwise return the original name
  return normalizedNames[normalized] || mealName;
};