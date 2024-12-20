import { supabase } from '@/config/supabase';
import logger from '@/config/logger';

export const checkVoucherRecords = async () => {
  const { count, error } = await supabase
    .from('uso_voucher')
    .select('*', { count: 'exact', head: true });

  if (error) {
    logger.error('Erro ao verificar registros na tabela:', {
      error: error.message,
      code: error.code,
      details: error.details
    });
  } else {
    logger.info(`Total de registros na tabela uso_voucher: ${count}`);
  }

  return count;
};