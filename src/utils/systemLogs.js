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

    const { error } = await supabase
      .from('logs_sistema')
      .insert([{
        tipo,
        mensagem: mensagem || 'Sem mensagem',
        detalhes: detalhes || '{}',
        nivel,
        criado_em: new Date().toISOString()
      }]);

    if (error) {
      logger.error('Erro ao registrar log:', error);
      throw error;
    }
  } catch (error) {
    logger.error('Erro ao registrar log:', error);
    // Não propagar o erro para não interromper o fluxo principal
  }
};