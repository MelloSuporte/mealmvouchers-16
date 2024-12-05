import { supabase } from '../config/supabase';
import logger from '../config/logger';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const generateUniqueVoucherFromCPF = async (cpf, date = '') => {
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
      // Gera um código baseado nos últimos 4 dígitos do CPF + timestamp + data
      const timestamp = Date.now().toString().slice(-4);
      const cpfEnd = cleanCPF.slice(-4);
      const dateStr = date ? date.replace(/\D/g, '').slice(-4) : '';
      const voucher = (parseInt(cpfEnd + timestamp + dateStr) % 9000 + 1000).toString();
      
      logger.info(`Tentando gerar voucher: ${voucher} para CPF ${cleanCPF} e data ${date}`);

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
        logger.info(`Voucher gerado com sucesso: ${voucher}`);
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