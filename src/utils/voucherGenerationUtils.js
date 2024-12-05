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

  // Primeiro, busca o voucher existente do usuário
  const { data: existingUser, error: userError } = await supabase
    .from('usuarios')
    .select('voucher')
    .eq('cpf', cleanCPF)
    .single();

  if (userError) {
    logger.error(`Erro ao buscar usuário com CPF ${cleanCPF}:`, userError);
    throw new Error('Erro ao buscar usuário');
  }

  // Se encontrar um voucher existente, retorna ele
  if (existingUser?.voucher) {
    logger.info(`Voucher existente encontrado para CPF ${cleanCPF}: ${existingUser.voucher}`);
    return existingUser.voucher;
  }

  // Se não encontrar um voucher existente (caso improvável), gera um novo
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    try {
      const voucher = Math.floor(1000 + Math.random() * 9000).toString();
      
      // Verifica se o voucher já existe
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

      if ((!existingCommon || existingCommon.length === 0) && 
          (!existingExtras || existingExtras.length === 0)) {
        logger.info(`Novo voucher gerado com sucesso para CPF ${cleanCPF}: ${voucher}`);
        return voucher;
      }

      attempts++;
      await delay(100);
      
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
  return /^\d{4}$/.test(voucher);
};