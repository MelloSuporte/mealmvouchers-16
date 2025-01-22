import { findCommonVoucher } from '../../components/voucher/validators/commonVoucherValidator';
import { findDisposableVoucher } from '../../components/voucher/validators/disposableVoucherValidator';
import { validateMealTime } from '../../components/voucher/validators/timeValidator';
import logger from '../../config/logger';

export const validateCommonVoucher = async (code) => {
  try {
    return await findCommonVoucher(code);
  } catch (error) {
    logger.error('Erro ao validar voucher comum:', error);
    throw error;
  }
};

export const validateDisposableVoucher = async (code) => {
  try {
    return await findDisposableVoucher(code);
  } catch (error) {
    logger.error('Erro ao validar voucher descartável:', error);
    throw error;
  }
};

export const validateVoucherTime = async (tipoRefeicaoId) => {
  try {
    return await validateMealTime(tipoRefeicaoId);
  } catch (error) {
    logger.error('Erro ao validar horário do voucher:', error);
    throw error;
  }
};