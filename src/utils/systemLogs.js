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
  LOG_GENERICO: 'LOG_GENERICO' // Tipo padrão para fallback
};

export const logSystemEvent = async ({
  tipo,
  mensagem,
  detalhes,
  nivel = 'info'
}) => {
  try {
    // Garantir que tipo nunca seja nulo usando um fallback
    const tipoLog = tipo || LOG_TYPES.LOG_GENERICO;

    const dados = {
      detalhes: typeof detalhes === 'string' ? JSON.parse(detalhes) : detalhes || {},
      nivel: nivel
    };

    const { error } = await supabase
      .from('logs_sistema')
      .insert({
        tipo: tipoLog,
        mensagem: mensagem || 'Sem mensagem',
        dados: dados,
        nivel: nivel
      });

    if (error) {
      console.error('Erro ao registrar log:', error);
    }
  } catch (error) {
    console.error('Erro ao registrar log:', error);
  }
};