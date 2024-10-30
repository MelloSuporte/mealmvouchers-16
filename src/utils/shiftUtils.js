export const isWithinShiftHours = (shift, currentTime) => {
  const timeRanges = {
    'central': { start: '08:00', end: '17:00' },
    'primeiro': { start: '06:00', end: '14:00' },
    'segundo': { start: '14:00', end: '22:00' },
    'terceiro': { start: '22:00', end: '06:00' }
  };
  
  const range = timeRanges[shift];
  const current = currentTime.split(':').map(Number);
  const start = range.start.split(':').map(Number);
  const end = range.end.split(':').map(Number);
  
  if (shift === 'terceiro') {
    return (current[0] >= start[0] || current[0] <= end[0]);
  }
  
  return (current[0] >= start[0] && current[0] < end[0]);
};

export const getAllowedMealsByShift = (shift) => {
  const mealsByShift = {
    'central': ['Café', 'Almoço', 'Lanche'],
    'primeiro': ['Café', 'Almoço'],
    'segundo': ['Lanche', 'Jantar'],
    'terceiro': ['Café', 'Ceia']
  };
  return mealsByShift[shift] || [];
};