import logger from '../config/logger';

export const findValidVoucher = async (db, code) => {
  const [vouchers] = await db.execute(
    `SELECT dv.*, mt.name as meal_type_name, mt.id as meal_type_id,
            mt.start_time, mt.end_time, mt.tolerance_minutes
     FROM disposable_vouchers dv 
     JOIN meal_types mt ON dv.meal_type_id = mt.id 
     WHERE dv.code = ? AND dv.is_used = FALSE 
     AND (dv.expired_at IS NULL OR DATE(dv.expired_at) >= CURDATE())`,
    [code]
  );

  if (vouchers.length === 0) {
    logger.warn(`Tentativa de uso de voucher inválido ou expirado: ${code}`);
    throw new Error('Voucher inválido, já utilizado ou expirado');
  }

  return vouchers[0];
};

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
    'UPDATE disposable_vouchers SET is_used = TRUE, used_at = NOW(3) WHERE id = ?',
    [voucherId]
  );
};