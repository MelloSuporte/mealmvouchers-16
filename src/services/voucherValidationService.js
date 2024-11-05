import logger from '../config/logger';

export const validateVoucherCode = async (db, code) => {
  if (!/^\d{4}$/.test(code)) {
    logger.warn(`Formato inválido de código: ${code}`);
    return { 
      error: 'Código deve conter exatamente 4 dígitos numéricos',
      exists: false 
    };
  }

  const [disposableVouchers] = await db.execute(
    'SELECT id FROM disposable_vouchers WHERE code = ?',
    [code]
  );

  const [userVouchers] = await db.execute(
    'SELECT id FROM users WHERE voucher = ?',
    [code]
  );

  return { exists: disposableVouchers.length > 0 || userVouchers.length > 0 };
};

export const validateMealType = async (db, mealTypeId) => {
  const [mealTypes] = await db.execute(
    'SELECT id FROM meal_types WHERE id = ? AND is_active = TRUE',
    [mealTypeId]
  );

  if (mealTypes.length === 0) {
    logger.warn(`Tipo de refeição inválido ou inativo: ${mealTypeId}`);
    throw new Error('Tipo de refeição inválido ou inativo');
  }

  return true;
};