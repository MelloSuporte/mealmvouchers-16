import { supabase } from '../../config/supabase';
import logger from '../../config/logger';
import { logSystemEvent, LOG_TYPES } from '../../utils/systemLogs';

export const validateVoucher = async ({
  voucherCode,
  mealType,
  mealName,
  cpf,
  turnoId
}) => {
  try {
    // Log da tentativa de validação com tipo explícito
    await logSystemEvent({
      tipo: LOG_TYPES.VALIDACAO_VOUCHER,
      mensagem: `Tentativa de validação de voucher: ${voucherCode}`,
      detalhes: JSON.stringify({ mealType, mealName, voucherCode, cpf, turnoId }),
      nivel: 'info'
    });

    // Valida o voucher
    const { data: validationResult, error: validationError } = await supabase.rpc('validate_and_use_voucher', {
      p_codigo: voucherCode,
      p_tipo_refeicao_id: mealType
    });

    if (validationError) {
      logger.error('Erro na validação:', validationError);
      await logSystemEvent({
        tipo: LOG_TYPES.ERRO_VALIDACAO_VOUCHER,
        mensagem: validationError.message || 'Erro ao validar voucher',
        detalhes: JSON.stringify({ error: validationError }),
        nivel: 'error'
      });
      throw new Error(validationError.message || 'Erro ao validar voucher');
    }

    if (!validationResult?.success) {
      await logSystemEvent({
        tipo: LOG_TYPES.ERRO_VALIDACAO_VOUCHER,
        mensagem: validationResult?.error || 'Erro ao validar voucher',
        detalhes: JSON.stringify({ result: validationResult }),
        nivel: 'error'
      });
      throw new Error(validationResult?.error || 'Erro ao validar voucher');
    }

    return validationResult;
  } catch (error) {
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
      await logSystemEvent({
        tipo: LOG_TYPES.ERRO_USO_VOUCHER,
        mensagem: 'Erro ao registrar uso do voucher',
        detalhes: JSON.stringify({ error: usageError.message }),
        nivel: 'error'
      });
      throw new Error(usageError.message || 'Erro ao registrar uso do voucher');
    }

    await logSystemEvent({
      tipo: LOG_TYPES.USO_VOUCHER,
      mensagem: `Voucher utilizado com sucesso`,
      detalhes: JSON.stringify({ mealType, mealName, userId }),
      nivel: 'info'
    });
  } catch (error) {
    logger.error('Erro ao registrar uso:', error);
    throw error;
  }
};