import { supabase } from '../config/supabase';
import logger from '../config/logger';

const generateVoucherFromCPF = (cpf) => {
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '');
  
  if (cleanCPF.length !== 11) {
    throw new Error('CPF inválido: deve ter 11 dígitos');
  }

  // Pega os 4 últimos dígitos do CPF
  const lastFourDigits = cleanCPF.slice(-4);
  
  // Soma os dígitos
  const sum = lastFourDigits.split('').reduce((acc, digit) => acc + parseInt(digit), 0);
  
  // Gera código de 4 dígitos baseado na soma
  const code = (sum % 9000 + 1000).toString();
  
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
        // Se houver duplicidade, modifica o CPF ligeiramente para gerar um novo código
        cpf = (parseInt(cpf) + 1).toString().padStart(11, '0');
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