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

export const validateDisposableVoucherRules = (voucher) => {
  // Verificar se o voucher já foi usado
  if (voucher.is_used) {
    throw new Error('Voucher Descartável já foi utilizado');
  }

  // Verificar se o voucher está expirado
  if (voucher.expired_at) {
    const expirationDate = new Date(voucher.expired_at);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expirationDate.setHours(0, 0, 0, 0);
    
    if (expirationDate < today) {
      throw new Error('Voucher Expirado');
    }

    if (expirationDate > today) {
      const formattedDate = expirationDate.toISOString().split('T')[0];
      throw new Error(`Voucher Descartável válido para o ${formattedDate}`);
    }
  }

  // Verificar horário da refeição
  const currentTime = new Date().toTimeString().slice(0, 5);
  validateVoucherTime(currentTime, voucher, voucher.tolerance_minutes || 15);
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
      if (mealType.toLowerCase() === 'extra') {
        throw new Error('Voucher Descartável não disponível para uso Extra');
      }
      break;

    default:
      throw new Error('Tipo de voucher inválido');
  }
};