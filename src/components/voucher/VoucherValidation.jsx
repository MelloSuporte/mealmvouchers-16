import { supabase } from '../../config/supabase';
import logger from '../../config/logger';

export const validateVoucher = async (voucherCode, mealType, mealName) => {
  try {
    logger.info('Iniciando validação do voucher:', voucherCode);

    // Primeiro tenta validar como voucher descartável
    const { data: disposableData, error: disposableError } = await supabase
      .from('vouchers_descartaveis')
      .select('*')
      .eq('codigo', voucherCode)
      .is('usado_em', null)
      .single();

    if (!disposableError && disposableData) {
      logger.info('Voucher descartável encontrado:', disposableData);
      
      const { data: validationData, error: validationError } = await supabase.rpc(
        'validate_disposable_voucher',
        {
          p_codigo: voucherCode,
          p_tipo_refeicao_id: mealType
        }
      );

      if (validationError) {
        logger.error('Erro na validação do voucher descartável:', validationError);
        throw new Error(validationError.message || 'Erro ao validar voucher descartável');
      }

      return validationData;
    }

    // Se não for descartável, tenta validar como voucher comum
    logger.info('Tentando validar como voucher comum:', voucherCode);

    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select(`
        *,
        empresas (
          id,
          nome,
          ativo
        ),
        turnos (
          id,
          tipo_turno
        )
      `)
      .eq('voucher', voucherCode)
      .eq('ativo', true)
      .eq('suspenso', false)
      .single();

    if (userError || !userData) {
      logger.error('Erro ao buscar usuário:', userError);
      throw new Error('Usuário não encontrado ou voucher inválido');
    }

    // Validar voucher comum
    const { data: validationData, error: validationError } = await supabase.rpc(
      'validate_common_voucher',
      {
        p_codigo: voucherCode,
        p_tipo_refeicao_id: mealType
      }
    );

    if (validationError) {
      logger.error('Erro na validação do voucher comum:', validationError);
      throw new Error(validationError.message || 'Erro ao validar voucher comum');
    }

    return {
      success: true,
      user: userData
    };

  } catch (error) {
    logger.error('Erro na validação:', error);
    throw error;
  }
};

export const registerVoucherUsage = async (userId, mealType, mealName) => {
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
      throw new Error(usageError.message || 'Erro ao registrar uso do voucher');
    }

    return { success: true };
  } catch (error) {
    logger.error('Erro ao registrar uso:', error);
    throw error;
  }
};