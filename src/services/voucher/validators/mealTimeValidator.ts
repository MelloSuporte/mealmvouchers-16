interface MealType {
  horario_inicio: string;
  horario_fim: string;
  minutos_tolerancia?: number;
}

export const validateMealTime = (tipoRefeicao: MealType) => {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  const startTime = tipoRefeicao.horario_inicio.split(':');
  const endTime = tipoRefeicao.horario_fim.split(':');
  
  const startMinutes = parseInt(startTime[0]) * 60 + parseInt(startTime[1]);
  const endMinutes = parseInt(endTime[0]) * 60 + parseInt(endTime[1]) + 
    (tipoRefeicao.minutos_tolerancia || 0);

  if (currentTime < startMinutes || currentTime > endMinutes) {
    return { 
      success: false, 
      error: `Esta refeição só pode ser utilizada entre ${tipoRefeicao.horario_inicio} e ${tipoRefeicao.horario_fim}`
    };
  }

  return { success: true };
};