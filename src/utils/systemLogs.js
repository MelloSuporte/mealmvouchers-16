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
  if (!tipo || !Object.values(LOG_TYPES).includes(tipo)) {
    console.warn('Tipo de log inválido:', tipo);
    return;
  }

  try {
    const logData = {
      tipo,
      mensagem: mensagem || 'Sem mensagem',
      detalhes: detalhes || '{}',
      nivel,
      criado_em: new Date().toISOString()
    };

    const { error } = await supabase
      .from('logs_sistema')
      .insert([logData])
      .single();

    if (error) {
      console.error('Erro ao registrar log:', error);
      return;
    }
  } catch (error) {
    console.error('Erro ao registrar log:', error);
  }
};