import { supabase } from '../config/supabase';
import logger from '../config/logger';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const generateUniqueVoucherFromCPF = async (cpf) => {
  if (!cpf) {
    throw new Error('CPF é obrigatório para gerar voucher');
  }

  // Remove caracteres não numéricos do CPF
  const cleanCPF = cpf.replace(/\D/g, '');
  
  // Valida se o CPF tem 11 dígitos
  if (cleanCPF.length !== 11) {
    throw new Error('CPF inválido: deve conter 11 dígitos');
  }

  // Pega os dígitos da posição 2 até 11 (10 dígitos)
  const digits = cleanCPF.slice(1);
  
  // Soma todos os dígitos
  const digitSum = digits.split('').reduce((sum, digit) => sum + parseInt(digit), 0);

  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    try {
      // Pega timestamp atual e seus últimos 2 dígitos
      const timestamp = Date.now();
      const lastTwoDigits = timestamp % 100;

      // Soma o resultado da soma dos dígitos com os últimos 2 dígitos do timestamp
      const total = digitSum + lastTwoDigits;

      // Gera um número entre 1000 e 9999
      const voucher = ((total % 9000) + 1000).toString();

      // Verifica se o voucher já existe
      const { data: existingVoucher, error } = await supabase
        .from('usuarios')
        .select('voucher')
        .eq('voucher', voucher)
        .limit(1);

      if (error) {
        logger.error('Erro ao verificar voucher existente:', error);
        throw error;
      }

      // Se o voucher não existir, retorna
      if (!existingVoucher || existingVoucher.length === 0) {
        logger.info(`Voucher gerado com sucesso: ${voucher}`);
        return voucher;
      }

      // Se existir, adiciona delay e tenta novamente
      attempts++;
      await delay(100); // 100ms de delay entre tentativas
      
    } catch (error) {
      logger.error('Erro ao gerar voucher:', error);
      throw error;
    }
  }

  throw new Error('Não foi possível gerar um voucher único após várias tentativas');
};

// Função auxiliar para validar voucher
export const validateVoucher = (voucher) => {
  if (!voucher) return false;
  
  // Verifica se tem exatamente 4 dígitos e são todos números
  return /^\d{4}$/.test(voucher);
};