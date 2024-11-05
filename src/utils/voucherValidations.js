import logger from '../config/logger';
import { VOUCHER_TYPES } from './voucherTypes';

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

export const validateVoucherByType = (voucherType, { code, cpf, mealType, user }) => {
  switch (voucherType) {
    case VOUCHER_TYPES.NORMAL:
      if (!code || !cpf || !mealType) {
        throw new Error('CPF, código do voucher e tipo de refeição são obrigatórios para voucher normal');
      }
      if (!user) {
        throw new Error('Usuário não encontrado ou voucher inválido');
      }
      break;

    case VOUCHER_TYPES.EXTRA:
      if (!code || !cpf || !mealType) {
        throw new Error('CPF, código do voucher e tipo de refeição são obrigatórios para voucher extra');
      }
      if (!user?.id) {
        throw new Error('Usuário não encontrado para voucher extra');
      }
      break;

    case VOUCHER_TYPES.DISPOSABLE:
      if (!code || !mealType) {
        throw new Error('Código do voucher e tipo de refeição são obrigatórios para voucher descartável');
      }
      break;

    default:
      throw new Error('Tipo de voucher inválido');
  }
};

export const validateMealType = (voucher, mealType) => {
  if (!voucher || !mealType || voucher.meal_type_id !== mealType.id) {
    logger.warn(`Tipo de refeição não corresponde ao voucher: ${mealType?.name}`);
    throw new Error('Tipo de refeição não corresponde ao voucher');
  }
};