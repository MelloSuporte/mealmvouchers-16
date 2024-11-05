import logger from '../config/logger';

export const generateUniqueCode = async (db) => {
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    const code = String(Math.floor(1000 + Math.random() * 9000));
    
    const [disposableVouchers] = await db.execute(
      'SELECT id FROM disposable_vouchers WHERE code = ?',
      [code]
    );

    const [userVouchers] = await db.execute(
      'SELECT id FROM users WHERE voucher = ?',
      [code]
    );

    if (disposableVouchers.length === 0 && userVouchers.length === 0) {
      return code;
    }

    attempts++;
  }
  
  throw new Error('Não foi possível gerar um código único após várias tentativas');
};