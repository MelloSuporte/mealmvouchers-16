import { supabase } from '../../../config/supabase';
import logger from '../../../config/logger';
import { logSystemEvent, LOG_TYPES } from '../../../utils/systemLogs';

export const validateCommonVoucher = async (codigo: string, tipoRefeicaoId: string) => {
  try {
    logger.info('Validando voucher comum:', codigo);
    
    const { data: user, error } = await supabase
      .from('usuarios')
      .select(`
        *,
        empresas (
          nome,
          ativo
        ),
        turnos (
          tipo_turno,
          horario_inicio,
          horario_fim
        )
      `)
      .eq('voucher', String(codigo))
      .eq('suspenso', false)
      .single();

    if (error || !user) {
      logger.info('Voucher comum inválido');
      return { success: false, error: 'Voucher comum inválido' };
    }

    // Verificar se o usuário está suspenso
    if (user.suspenso) {
      return { success: false, error: 'Usuário suspenso' };
    }

    // Verificar se a empresa está ativa
    if (!user.empresas?.ativo) {
      return { success: false, error: 'Empresa inativa' };
    }

    // Registrar uso do voucher
    const { data: usoVoucher, error: usageError } = await supabase
      .from('uso_voucher')
      .insert({
        usuario_id: user.id,
        tipo_refeicao_id: tipoRefeicaoId,
        usado_em: new Date().toISOString(),
        tipo_voucher: 'comum'
      })
      .select()
      .single();

    if (usageError) {
      logger.error('Erro ao registrar uso do voucher comum:', usageError);
      throw usageError;
    }

    await logSystemEvent({
      tipo: LOG_TYPES.USO_VOUCHER,
      mensagem: 'Voucher comum utilizado com sucesso',
      detalhes: { userId: user.id, tipoRefeicaoId }
    });

    logger.info('Voucher comum válido:', user);
    return { 
      success: true, 
      user,
      usoVoucherId: usoVoucher.id 
    };
  } catch (error) {
    logger.error('Erro ao validar voucher comum:', error);
    throw error;
  }
};