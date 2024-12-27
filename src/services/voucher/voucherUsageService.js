import { supabase } from '../../config/supabase';
import logger from '../../config/logger';
import { LOG_TYPES, logSystemEvent } from '../../utils/systemLogs';

export const registerVoucherUsage = async (
  userId,
  tipoRefeicaoId,
  tipoVoucher,
  voucherDescartavelId = null
) => {
  try {
    await logSystemEvent({
      tipo: LOG_TYPES.TENTATIVA_VALIDACAO,
      mensagem: 'Iniciando registro de uso do voucher',
      detalhes: { userId, tipoRefeicaoId, tipoVoucher },
      nivel: 'info'
    });

    // Check for existing usage of this meal type today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: existingUsage, error: checkError } = await supabase
      .from('uso_voucher')
      .select('*')
      .eq('usuario_id', userId)
      .eq('tipo_refeicao_id', tipoRefeicaoId)
      .gte('usado_em', today.toISOString());

    if (checkError) {
      logger.error('Erro ao verificar uso existente:', checkError);
      throw checkError;
    }

    if (existingUsage && existingUsage.length > 0) {
      await logSystemEvent({
        tipo: LOG_TYPES.ERRO_USO_VOUCHER,
        mensagem: 'Tipo de refeição já utilizado hoje',
        detalhes: {
          userId,
          tipoRefeicaoId,
          tipoVoucher,
          existingUsage
        },
        nivel: 'error'
      });
      
      return { 
        success: false, 
        error: 'Tipo de refeição já utilizado hoje' 
      };
    }

    // Register new usage
    const { error } = await supabase
      .from('uso_voucher')
      .insert({
        usuario_id: userId,
        tipo_refeicao_id: tipoRefeicaoId,
        tipo_voucher: tipoVoucher,
        voucher_descartavel_id: voucherDescartavelId,
        usado_em: new Date().toISOString()
      });

    if (error) {
      await logSystemEvent({
        tipo: LOG_TYPES.ERRO_USO_VOUCHER,
        mensagem: 'Erro ao registrar uso do voucher',
        detalhes: {
          error: error.message,
          userId,
          tipoRefeicaoId,
          tipoVoucher
        },
        nivel: 'error'
      });

      logger.error('Erro ao registrar uso do voucher:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      return { success: false, error: 'Erro ao registrar uso do voucher' };
    }

    await logSystemEvent({
      tipo: LOG_TYPES.USO_VOUCHER,
      mensagem: 'Uso do voucher registrado com sucesso',
      detalhes: {
        userId,
        tipoRefeicaoId,
        tipoVoucher
      },
      nivel: 'info'
    });

    return { success: true };
  } catch (error) {
    await logSystemEvent({
      tipo: LOG_TYPES.ERRO_USO_VOUCHER,
      mensagem: 'Erro ao registrar uso do voucher',
      detalhes: {
        error: error.message,
        userId,
        tipoRefeicaoId,
        tipoVoucher
      },
      nivel: 'error'
    });

    logger.error('Erro ao registrar uso do voucher:', error);
    return { success: false, error: 'Erro ao registrar uso do voucher' };
  }
};