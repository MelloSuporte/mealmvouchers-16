import { supabase } from '../config/supabase';

export const LOG_TYPES = {
  VALIDACAO_VOUCHER: 'VALIDACAO_VOUCHER',
  ERRO_USO_VOUCHER: 'ERRO_USO_VOUCHER',
  USO_VOUCHER: 'USO_VOUCHER',
  ERRO_VALIDACAO_VOUCHER: 'ERRO_VALIDACAO_VOUCHER',
  TENTATIVA_VALIDACAO: 'TENTATIVA_VALIDACAO',
  VALIDACAO_SUCESSO: 'VALIDACAO_SUCESSO',
  VALIDACAO_FALHA: 'VALIDACAO_FALHA',
  VALIDACAO_TURNO: 'VALIDACAO_TURNO',
  LOG_GENERICO: 'LOG_GENERICO'
};

export const logSystemEvent = async ({
  tipo = LOG_TYPES.LOG_GENERICO,
  mensagem,
  detalhes,
  nivel = 'info'
}) => {
  try {
    // Garantir que tipo nunca seja nulo
    const tipoLog = tipo || LOG_TYPES.LOG_GENERICO;
    
    const dados = {
      nivel,
      detalhes: typeof detalhes === 'string' ? JSON.parse(detalhes) : detalhes || {}
    };

    const { error } = await supabase
      .from('logs_sistema')
      .insert({
        tipo: tipoLog,
        mensagem: mensagem || 'Sem mensagem',
        dados,
        nivel,
        detalhes: dados.detalhes
      });

    if (error) {
      console.error('Erro ao registrar log:', error);
    }
  } catch (error) {
    console.error('Erro ao registrar log:', error);
  }
};