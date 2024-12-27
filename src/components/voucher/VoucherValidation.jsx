import { supabase } from '../../config/supabase';
import logger from '../../config/logger';

export const validateVoucher = async ({
  voucherCode,
  mealType,
  mealName,
  cpf,
  turnoId
}) => {
  try {
    // Valida o voucher
    const { data, error: validationError } = await supabase.rpc('validate_and_use_voucher', {
      p_codigo: voucherCode,
      p_tipo_refeicao_id: mealType
    });

    if (validationError) {
      const errorMessage = validationError.message || 'Erro ao validar voucher';
      logger.error('Erro na validação:', validationError);
      throw new Error(errorMessage);
    }

    if (!data?.success) {
      const errorMessage = data?.error || 'Erro ao validar voucher';
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
      throw new Error(errorMessage);
    }
  } catch (error) {
    logger.error('Erro ao registrar uso:', error);
    throw error;
  }
};