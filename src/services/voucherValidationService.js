import logger from '../config/logger';

export const validateVoucherCode = async (db, code) => {
  if (!code) {
    throw new Error('Código do voucher é obrigatório');
  }

  const [vouchers] = await db.execute(
    'SELECT dv.*, mt.name as meal_type_name FROM disposable_vouchers dv ' +
    'JOIN meal_types mt ON dv.meal_type_id = mt.id ' +
    'WHERE dv.code = ? AND dv.is_used = FALSE',
    [code]
  );

  if (vouchers.length === 0) {
    return { exists: false, message: 'Voucher não encontrado ou já utilizado' };
  }

  return { 
    exists: true, 
    voucher: vouchers[0],
    message: 'Voucher válido'
  };
};

export const validateMealType = async (db, mealTypeId) => {
  const [mealTypes] = await db.execute(
    'SELECT * FROM meal_types WHERE id = ? AND is_active = TRUE',
    [mealTypeId]
  );

  if (mealTypes.length === 0) {
    throw new Error('Tipo de refeição inválido ou inativo');
  }

  return mealTypes[0];
};

export const validateExistingVoucher = async (db, code, mealTypeId) => {
  const [vouchers] = await db.execute(
    `SELECT dv.*, mt.name as meal_type_name, mt.start_time, mt.end_time 
     FROM disposable_vouchers dv
     JOIN meal_types mt ON dv.meal_type_id = mt.id
     WHERE dv.code = ? AND dv.is_used = FALSE`,
    [code]
  );

  if (vouchers.length === 0) {
    throw new Error('Voucher não encontrado ou já utilizado');
  }

  const voucher = vouchers[0];

  // Verificar se o tipo de refeição corresponde
  if (voucher.meal_type_id !== parseInt(mealTypeId)) {
    throw new Error('Tipo de refeição não corresponde ao voucher');
  }

  // Verificar se o voucher está expirado
  if (voucher.expired_at) {
    const expirationDate = new Date(voucher.expired_at);
    if (expirationDate < new Date()) {
      throw new Error('Voucher expirado');
    }
  }

  return voucher;
};