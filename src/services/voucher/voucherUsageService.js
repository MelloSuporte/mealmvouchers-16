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

    const { data, error } = await supabase
      .from('uso_voucher')
      .insert({
        usuario_id: userId,
        tipo_refeicao_id: tipoRefeicaoId,
        tipo_voucher: tipoVoucher,
        voucher_descartavel_id: voucherDescartavelId,
        usado_em: new Date().toISOString()
      })
      .select()
      .maybeSingle();

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
        tipoVoucher,
        data
      },
      nivel: 'info'
    });

    return { success: true, data };
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