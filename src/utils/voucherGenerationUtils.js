import { supabase } from '../config/supabase';
import logger from '../config/logger';

const generateVoucherFromCPF = (cpf) => {
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '');
  
  if (cleanCPF.length !== 11) {
    throw new Error('CPF inválido: deve ter 11 dígitos');
  }

  // Pega os dígitos da posição 2 até 11 do CPF
  const relevantDigits = cleanCPF.slice(1);
  
  // Soma os dígitos
  const sum = relevantDigits.split('').reduce((acc, digit) => acc + parseInt(digit), 0);
  
  // Adiciona um elemento de aleatoriedade usando timestamp
  const timestamp = Date.now();
  const randomFactor = timestamp % 100; // Pega os últimos 2 dígitos do timestamp
  
  // Gera código de 4 dígitos baseado na soma + aleatoriedade
  const baseNumber = (sum + randomFactor) % 9000 + 1000;
  const code = baseNumber.toString();
  
  return code;
};

export const generateUniqueVoucherFromCPF = async (cpf) => {
  try {
    let attempts = 0;
    const maxAttempts = 10;
    let isUnique = false;
    let voucherCode;

    while (!isUnique && attempts < maxAttempts) {
      voucherCode = generateVoucherFromCPF(cpf);
      
      // Verifica duplicidade na tabela de usuários
      const { data: existingUsers, error: userError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('voucher', voucherCode)
        .limit(1);

      if (userError) {
        logger.error('Erro ao verificar duplicidade de voucher:', userError);
        throw new Error('Erro ao verificar duplicidade de voucher');
      }

      if (!existingUsers || existingUsers.length === 0) {
        isUnique = true;
      } else {
        attempts++;
        // Se houver duplicidade, tenta novamente com um novo timestamp
        await new Promise(resolve => setTimeout(resolve, 10)); // Pequeno delay para garantir timestamp diferente
      }
    }

    if (!isUnique) {
      throw new Error('Não foi possível gerar um voucher único após várias tentativas');
    }

    // O voucher comum nunca expira, então não há necessidade de adicionar data de expiração
    return voucherCode;
  } catch (error) {
    logger.error('Erro ao gerar voucher único:', error);
    throw error;
  }
};