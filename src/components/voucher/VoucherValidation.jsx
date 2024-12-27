import { supabase } from '../../config/supabase';
import { logSystemEvent, LOG_TYPES } from '../../utils/systemLogs';
import logger from '../../config/logger';

export const validateVoucher = async (codigo, tipoRefeicaoId) => {
  try {
    // Log da tentativa de validação
    await logSystemEvent({
      tipo: LOG_TYPES.TENTATIVA_VALIDACAO,
      mensagem: `Iniciando validação do voucher comum: ${codigo}`,
      detalhes: { codigo, tipoRefeicaoId }
    });

    // Validação do voucher comum
    logger.info('Validando voucher comum:', codigo);
    const { data: usuario, error: errorUsuario } = await supabase
      .from('usuarios')
      .select('*, empresas(*), turnos(*)')
      .eq('voucher', codigo)
      .single();

    if (errorUsuario) {
      await logSystemEvent({
        tipo: LOG_TYPES.ERRO_VALIDACAO_VOUCHER,
        mensagem: 'Erro ao consultar usuário',
        detalhes: errorUsuario,
        nivel: 'error'
      });
      throw errorUsuario;
    }

    if (!usuario) {
      await logSystemEvent({
        tipo: LOG_TYPES.VALIDACAO_FALHA,
        mensagem: 'Voucher comum não encontrado',
        detalhes: { codigo }
      });
      return { success: false, error: 'Voucher inválido' };
    }

    // Verificar se o usuário está suspenso
    if (usuario.suspenso) {
      await logSystemEvent({
        tipo: LOG_TYPES.VALIDACAO_FALHA,
        mensagem: 'Usuário suspenso',
        detalhes: { codigo, usuario_id: usuario.id }
      });
      return { success: false, error: 'Usuário suspenso' };
    }

    // Verificar se a empresa está ativa
    if (!usuario.empresas?.ativo) {
      await logSystemEvent({
        tipo: LOG_TYPES.VALIDACAO_FALHA,
        mensagem: 'Empresa inativa',
        detalhes: { codigo, empresa_id: usuario.empresa_id }
      });
      return { success: false, error: 'Empresa inativa' };
    }

    // Log do sucesso da validação
    await logSystemEvent({
      tipo: LOG_TYPES.VALIDACAO_SUCESSO,
      mensagem: 'Voucher comum válido',
      detalhes: usuario
    });

    return { success: true, user: usuario };
  } catch (error) {
    // Log de erro na validação
    await logSystemEvent({
      tipo: LOG_TYPES.ERRO_VALIDACAO_VOUCHER,
      mensagem: 'Erro na validação',
      detalhes: error,
      nivel: 'error'
    });
    
    logger.error('Erro na validação:', error);
    throw error;
  }
};

export const registerVoucherUsage = async ({
  userId,
  mealType,
  mealName
}) => {
  try {
    const { error: usageError } = await supabase
      .from('uso_voucher')
      .insert({
        usuario_id: userId,
        tipo_refeicao_id: mealType,
        usado_em: new Date().toISOString(),
        observacao: `Refeição: ${mealName}`
      });

    if (usageError) {
      logger.error('Erro ao registrar uso:', usageError);
      throw new Error('Erro ao registrar uso do voucher');
    }
  } catch (error) {
    logger.error('Erro ao registrar uso:', error);
    throw error;
  }
};