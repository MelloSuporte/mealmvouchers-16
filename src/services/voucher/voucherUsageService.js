import { supabase } from '../../config/supabase';
import logger from '../../config/logger';
import { LOG_TYPES } from '../../utils/systemLogs';

export const registerVoucherUsage = async (
  userId,
  tipoRefeicaoId,
  tipoVoucher,
  voucherDescartavelId = null
) => {
  try {
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
      await supabase
        .from('logs_sistema')
        .insert({
          tipo: LOG_TYPES.ERRO_USO_VOUCHER,
          mensagem: 'Erro ao registrar uso do voucher',
          nivel: 'error',
          detalhes: {
            error: error.message,
            userId,
            tipoRefeicaoId,
            tipoVoucher
          }
        });

      logger.error('Erro ao registrar uso do voucher:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      return { success: false, error: 'Erro ao registrar uso do voucher' };
    }

    await supabase
      .from('logs_sistema')
      .insert({
        tipo: LOG_TYPES.USO_VOUCHER,
        mensagem: 'Uso do voucher registrado com sucesso',
        nivel: 'info',
        detalhes: {
          userId,
          tipoRefeicaoId,
          tipoVoucher,
          data
        }
      });

    return { success: true, data };
  } catch (error) {
    logger.error('Erro ao registrar uso do voucher:', error);
    
    await supabase
      .from('logs_sistema')
      .insert({
        tipo: LOG_TYPES.ERRO_USO_VOUCHER,
        mensagem: 'Erro ao registrar uso do voucher',
        nivel: 'error',
        detalhes: {
          error: error.message,
          userId,
          tipoRefeicaoId,
          tipoVoucher
        }
      });

    return { success: false, error: 'Erro ao registrar uso do voucher' };
  }
};