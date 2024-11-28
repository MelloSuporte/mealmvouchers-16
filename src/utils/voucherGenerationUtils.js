import { supabase } from '../config/supabase';
import logger from '../config/logger';

export const generateUniqueCode = async () => {
  const length = 8;
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;

  while (!isUnique && attempts < maxAttempts) {
    code = '';
    for (let i = 0; i < length; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    // Verificar se o código já existe
    const { data: existingVoucher, error } = await supabase
      .from('vouchers_extras')
      .select('id')
      .eq('codigo', code)
      .limit(1);

    if (error) {
      logger.error('Erro ao verificar código:', error);
      throw new Error('Erro ao gerar código único');
    }

    if (!existingVoucher || existingVoucher.length === 0) {
      isUnique = true;
    } else {
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  if (!isUnique) {
    throw new Error('Não foi possível gerar um código único após várias tentativas');
  }

  return code;
};