import logger from '../config/logger';

export const validateVoucherTime = (currentTime, mealType, toleranceMinutes) => {
  const endTime = new Date();
  const [endHours, endMinutes] = mealType.end_time.split(':');
  endTime.setHours(parseInt(endHours), parseInt(endMinutes) + toleranceMinutes);
  const endTimeWithTolerance = endTime.toTimeString().slice(0, 5);

  if (currentTime < mealType.start_time || currentTime > endTimeWithTolerance) {
    logger.warn(`Tentativa de uso fora do horário permitido: ${currentTime}`);
    throw new Error(`Esta refeição só pode ser utilizada entre ${mealType.start_time} e ${mealType.end_time} (tolerância de ${toleranceMinutes} minutos)`);
  }
};

export const validateVoucherCode = (code) => {
  if (!code || !/^\d{4}$/.test(code)) {
    logger.warn(`Formato inválido de código: ${code}`);
    throw new Error('Código deve conter exatamente 4 dígitos numéricos');
  }
};

export const validateMealType = (voucher, mealType) => {
  if (!voucher || !mealType || voucher.meal_type_id !== mealType.id) {
    logger.warn(`Tipo de refeição não corresponde ao voucher: ${mealType?.name}`);
    throw new Error('Tipo de refeição não corresponde ao voucher');
  }
};