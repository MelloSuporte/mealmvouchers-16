import { supabase } from '../config/supabase';
import logger from '../config/logger';

export const LOG_TYPES = {
  VALIDACAO_VOUCHER: 'VALIDACAO_VOUCHER',
  ERRO_USO_VOUCHER: 'ERRO_USO_VOUCHER',
  USO_VOUCHER: 'USO_VOUCHER',
  ERRO_VALIDACAO_VOUCHER: 'ERRO_VALIDACAO_VOUCHER'
};

export const logSystemEvent = async ({
  tipo,
  mensagem,
  detalhes,
  nivel = 'info'
}) => {
  try {
    if (!tipo || !Object.values(LOG_TYPES).includes(tipo)) {
      logger.error('Tipo de log inválido ou não especificado');
      throw new Error('Tipo de log é obrigatório e deve ser um dos tipos válidos');
    }

    const { error } = await supabase.rpc('insert_log_sistema', {
      p_tipo: tipo,
      p_mensagem: mensagem || 'Sem mensagem',
      p_detalhes: detalhes || '{}',
      p_nivel: nivel
    });

    if (error) {
      logger.error('Erro ao registrar log:', error);
      throw error;
    }
  } catch (error) {
    logger.error('Erro ao registrar log:', error);
    throw error;
  }
};