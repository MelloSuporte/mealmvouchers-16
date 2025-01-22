import logger from '../../../config/logger';

export const validateMealTime = (tipoRefeicao) => {
  try {
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
  } catch (error) {
    logger.error('Erro ao validar horário:', error);
    return { success: false, error: 'Erro ao validar horário da refeição' };
  }
};