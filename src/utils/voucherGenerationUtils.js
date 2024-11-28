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

export const generateUniqueVoucherFromCPF = async (cpf) => {
  if (!cpf) {
    throw new Error('CPF é obrigatório para gerar voucher');
  }

  const cleanCPF = cpf.replace(/\D/g, '');
  const lastFourDigits = cleanCPF.slice(-4);
  let voucher = lastFourDigits;
  
  // Verifica se o voucher já existe
  const { data: existingVoucher } = await supabase
    .from('usuarios')
    .select('voucher')
    .eq('voucher', voucher)
    .limit(1);

  // Se o voucher já existir, adiciona um número sequencial
  if (existingVoucher && existingVoucher.length > 0) {
    const { data: maxVoucher } = await supabase
      .from('usuarios')
      .select('voucher')
      .ilike('voucher', `${lastFourDigits}%`)
      .order('voucher', { ascending: false })
      .limit(1);

    if (maxVoucher && maxVoucher.length > 0) {
      const currentNumber = parseInt(maxVoucher[0].voucher.slice(4)) || 0;
      voucher = `${lastFourDigits}${(currentNumber + 1).toString().padStart(2, '0')}`;
    } else {
      voucher = `${lastFourDigits}01`;
    }
  }

  return voucher;
};