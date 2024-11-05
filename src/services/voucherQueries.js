import logger from '../config/logger';

export const findActiveMealType = async (db, mealType) => {
  const [mealTypes] = await db.execute(
    'SELECT id, name, start_time, end_time FROM meal_types WHERE name = ? AND is_active = TRUE',
    [mealType]
  );

  if (mealTypes.length === 0) {
    logger.warn(`Tipo de refeição inválido ou inativo: ${mealType}`);
    throw new Error('Tipo de refeição inválido ou inativo');
  }

  return mealTypes[0];
};

export const markVoucherAsUsed = async (db, voucherId) => {
  await db.execute(
    'UPDATE disposable_vouchers SET is_used = TRUE, used_at = NOW() WHERE id = ?',
    [voucherId]
  );
};