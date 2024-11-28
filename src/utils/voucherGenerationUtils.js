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

  // Primeiro, verifica se já existe um voucher para este CPF
  const { data: existingUser } = await supabase
    .from('usuarios')
    .select('voucher')
    .eq('cpf', cleanCPF)
    .single();

  // Se encontrar um voucher existente, retorna ele
  if (existingUser?.voucher) {
    logger.info(`Voucher existente encontrado para CPF ${cleanCPF}: ${existingUser.voucher}`);
    return existingUser.voucher;
  }

  // Se não encontrar, verifica nos vouchers extras
  const { data: existingExtra } = await supabase
    .from('vouchers_extras')
    .select('codigo')
    .eq('cpf', cleanCPF)
    .limit(1);

  // Se encontrar nos vouchers extras, retorna o mesmo código
  if (existingExtra && existingExtra.length > 0) {
    logger.info(`Voucher extra existente encontrado para CPF ${cleanCPF}: ${existingExtra[0].codigo}`);
    return existingExtra[0].codigo;
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

      // Verifica se o voucher já existe em ambas as tabelas
      const [{ data: existingCommon }, { data: existingExtras }] = await Promise.all([
        supabase
          .from('usuarios')
          .select('voucher')
          .eq('voucher', voucher)
          .limit(1),
        supabase
          .from('vouchers_extras')
          .select('codigo')
          .eq('codigo', voucher)
          .limit(1)
      ]);

      // Se o voucher não existir em nenhuma das tabelas, retorna
      if ((!existingCommon || existingCommon.length === 0) && 
          (!existingExtras || existingExtras.length === 0)) {
        logger.info(`Novo voucher gerado com sucesso para CPF ${cleanCPF}: ${voucher}`);
        return voucher;
      }

      // Se existir em alguma das tabelas, adiciona delay e tenta novamente
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