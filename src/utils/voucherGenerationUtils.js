import { supabase } from '../config/supabase';
import logger from '../config/logger';

const generateVoucherCode = (cpf) => {
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '');
  
  // Verifica se o CPF tem pelo menos 13 dígitos
  if (cleanCPF.length < 13) {
    throw new Error('CPF inválido: deve ter pelo menos 13 dígitos');
  }

  // Extrai do 2º ao 13º dígito
  const relevantDigits = cleanCPF.slice(1, 13);
  
  // Soma os dígitos
  const sum = relevantDigits.split('').reduce((acc, digit) => acc + parseInt(digit), 0);
  
  // Gera código de 4 dígitos
  return sum.toString().padStart(4, '0').slice(-4);
};

export const generateUniqueVoucherFromCPF = async (cpf) => {
  try {
    let attempts = 0;
    const maxAttempts = 10; // Limite de tentativas para evitar loop infinito
    let isUnique = false;
    let voucherCode;

    while (!isUnique && attempts < maxAttempts) {
      voucherCode = generateVoucherCode(cpf);
      
      // Verifica duplicidade na tabela de usuários
      const { data: existingUsers, error: userError } = await supabase
        .from('users')
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
        // Se houver duplicidade, incrementa o código e tenta novamente
        attempts++;
        cpf = (parseInt(cpf) + 1).toString().padStart(13, '0');
      }
    }

    if (!isUnique) {
      throw new Error('Não foi possível gerar um voucher único após várias tentativas');
    }

    return voucherCode;
  } catch (error) {
    logger.error('Erro ao gerar voucher único:', error);
    throw error;
  }
};

// Função auxiliar para validar CPF (mantida para compatibilidade)
export const validateCPF = (cpf) => {
  const cleanCPF = cpf.replace(/\D/g, '');
  if (cleanCPF.length < 13) {
    return false;
  }
  return true;
};