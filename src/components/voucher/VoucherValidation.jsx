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
    // Log inicial da tentativa de validação
    logSystemEvent({
      tipo: LOG_TYPES.VALIDACAO_VOUCHER,
      mensagem: `Tentativa de validação de voucher: ${voucherCode}`,
      detalhes: JSON.stringify({ mealType, mealName, voucherCode, cpf, turnoId }),
      nivel: 'info'
    });

    // Valida o voucher
    const { data, error: validationError } = await supabase.rpc('validate_and_use_voucher', {
      p_codigo: voucherCode,
      p_tipo_refeicao_id: mealType
    });

    if (validationError) {
      const errorMessage = validationError.message || 'Erro ao validar voucher';
      logger.error('Erro na validação:', validationError);
      
      logSystemEvent({
        tipo: LOG_TYPES.ERRO_VALIDACAO_VOUCHER,
        mensagem: errorMessage,
        detalhes: JSON.stringify({ error: validationError }),
        nivel: 'error'
      });
      
      throw new Error(errorMessage);
    }

    if (!data?.success) {
      const errorMessage = data?.error || 'Erro ao validar voucher';
      
      logSystemEvent({
        tipo: LOG_TYPES.ERRO_VALIDACAO_VOUCHER,
        mensagem: errorMessage,
        detalhes: JSON.stringify({ result: data }),
        nivel: 'error'
      });
      
      throw new Error(errorMessage);
    }

    return data;
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
      const errorMessage = usageError.message || 'Erro ao registrar uso do voucher';
      
      logSystemEvent({
        tipo: LOG_TYPES.ERRO_USO_VOUCHER,
        mensagem: errorMessage,
        detalhes: JSON.stringify({ error: usageError }),
        nivel: 'error'
      });
      
      throw new Error(errorMessage);
    }

    logSystemEvent({
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