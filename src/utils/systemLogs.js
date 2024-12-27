import { supabase } from '../config/supabase';

export const LOG_TYPES = {
  VALIDACAO_VOUCHER: 'VALIDACAO_VOUCHER',
  ERRO_USO_VOUCHER: 'ERRO_USO_VOUCHER',
  USO_VOUCHER: 'USO_VOUCHER',
  ERRO_VALIDACAO_VOUCHER: 'ERRO_VALIDACAO_VOUCHER',
  TENTATIVA_VALIDACAO: 'TENTATIVA_VALIDACAO',
  VALIDACAO_SUCESSO: 'VALIDACAO_SUCESSO',
  VALIDACAO_FALHA: 'VALIDACAO_FALHA'
};

export const logSystemEvent = async ({
  tipo,
  mensagem,
  detalhes,
  nivel = 'info'
}) => {
  if (!tipo || !Object.values(LOG_TYPES).includes(tipo)) {
    console.warn('Tipo de log inválido ou não especificado:', tipo);
    tipo = 'ERRO_VALIDACAO_VOUCHER'; // Fallback para garantir que sempre tenha um tipo
  }

  try {
    const { error } = await supabase.rpc('insert_system_log', {
      p_tipo: tipo,
      p_mensagem: mensagem || 'Sem mensagem',
      p_detalhes: typeof detalhes === 'string' ? JSON.parse(detalhes) : detalhes || {},
      p_nivel: nivel
    });

    if (error) {
      console.error('Erro ao registrar log:', error);
    }
  } catch (error) {
    console.error('Erro ao registrar log:', error);
  }
};