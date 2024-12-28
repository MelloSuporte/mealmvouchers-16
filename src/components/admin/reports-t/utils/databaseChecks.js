import { supabase } from '@/config/supabase';
import logger from '@/config/logger';

export const checkVoucherRecords = async () => {
  try {
    logger.info('Verificando existência de registros na tabela uso_voucher');
    
    const { count, error } = await supabase
      .from('uso_voucher')
      .select('*', { count: 'exact', head: true });

    if (error) {
      logger.error('Erro ao verificar registros:', error);
      throw error;
    }

    logger.info(`Total de registros na tabela: ${count || 0}`);
    
    if (count === 0) {
      logger.warn('Nenhum registro encontrado na tabela uso_voucher');
    }

    return count;
  } catch (error) {
    logger.error('Erro ao verificar registros de voucher:', error);
    throw error;
  }
};