import { supabase } from '../config/supabase';
import logger from '../config/logger';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const generateRandomCode = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

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

  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    try {
      const voucher = generateRandomCode();
      
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