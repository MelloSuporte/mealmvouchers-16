import { supabase } from '../../config/supabase';
import logger from '../../config/logger';
import { logSystemEvent, LOG_TYPES } from '../../utils/systemLogs';

export const registerVoucherUsage = async ({
  userId,
  tipoRefeicaoId,
  tipoVoucher,
  voucherDescartavelId = null
}) => {
  try {
    // Validate required parameters based on voucher type
    if (tipoVoucher === 'comum' && (!userId || !tipoRefeicaoId)) {
      throw new Error('Usuário e tipo de refeição são obrigatórios para voucher comum');
    }

    if (tipoVoucher === 'descartavel' && (!voucherDescartavelId || !tipoRefeicaoId)) {
      throw new Error('ID do voucher descartável e tipo de refeição são obrigatórios');
    }

    logger.info('Registrando uso de voucher:', {
      userId,
      tipoRefeicaoId,
      tipoVoucher,
      voucherDescartavelId
    });

    // Check if meal type was already used today
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

    if (existingUsage?.length > 0) {
      logger.info('Tipo de refeição já utilizado hoje:', {
        userId,
        tipoRefeicaoId,
        existingUsage
      });

      await logSystemEvent({
        tipo: LOG_TYPES.ERRO_USO_VOUCHER,
        mensagem: 'Tipo de refeição já utilizado hoje',
        detalhes: {
          userId,
          tipoRefeicaoId,
          tipoVoucher
        },
        nivel: 'warning'
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

      return { 
        success: false, 
        error: 'Erro ao registrar uso do voucher' 
      };
    }

    // Log successful usage
    await logSystemEvent({
      tipo: LOG_TYPES.USO_VOUCHER,
      mensagem: 'Voucher utilizado com sucesso',
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
        stack: error.stack
      },
      nivel: 'error'
    });

    logger.error('Erro ao registrar uso do voucher:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });

    return { 
      success: false, 
      error: error.message || 'Erro ao registrar uso do voucher' 
    };
  }
};