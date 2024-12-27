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
    logger.info('Iniciando validação do voucher:', voucherCode);

    // Primeiro tenta validar como voucher descartável
    const { data: disposableData, error: disposableError } = await supabase
      .from('vouchers_descartaveis')
      .select(`
        *,
        tipos_refeicao (*)
      `)
      .eq('codigo', voucherCode)
      .is('usado_em', null)
      .single();

    logger.info('Resultado da consulta:', { voucher: disposableData, error: disposableError });

    if (!disposableError && disposableData) {
      // Validar voucher descartável
      logger.info('Iniciando validação detalhada do voucher descartável:', voucherCode);
      
      const { data: validationData, error: validationError } = await supabase.rpc(
        'validate_disposable_voucher',
        {
          p_codigo: voucherCode,
          p_tipo_refeicao_id: mealType
        },
        {
          headers: {
            'Content-Profile': 'public'
          }
        }
      );

      if (validationError) {
        logger.error('Erro na validação do voucher descartável:', validationError);
        throw new Error(validationError.message || 'Erro ao validar voucher descartável');
      }

      logger.info('Resultado validação voucher descartável:', validationData);
      return validationData;
    }

    logger.info('Voucher não encontrado ou já utilizado');
    
    // Se não for descartável, tenta validar como voucher comum
    logger.info('Validando voucher comum:', voucherCode);

    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select(`
        *,
        empresas (*),
        turnos (*)
      `)
      .eq('voucher', voucherCode)
      .eq('suspenso', false)
      .single();

    logger.info('Resultado da consulta de usuário:', { user: userData, error: userError });

    if (userError || !userData) {
      throw new Error('Usuário não encontrado ou voucher inválido');
    }

    if (!userData.empresas?.ativo) {
      throw new Error('Empresa do usuário não está ativa');
    }

    // Validar voucher comum
    const { data: validationData, error: validationError } = await supabase.rpc(
      'validate_and_use_voucher',
      {
        p_codigo: voucherCode,
        p_tipo_refeicao_id: mealType
      },
      {
        headers: {
          'Content-Profile': 'public'
        }
      }
    );

    if (validationError) {
      logger.error('Erro na validação do voucher comum:', validationError);
      throw new Error(validationError.message || 'Erro ao validar voucher comum');
    }

    logger.info('Resultado validação voucher comum:', { success: true, user: userData });
    logger.info('Voucher comum válido:', userData);

    return {
      success: true,
      user: userData
    };

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
      }, {
        headers: {
          'Content-Profile': 'public'
        }
      });

    if (usageError) {
      logger.error('Erro ao registrar uso:', usageError);
      throw new Error(usageError.message || 'Erro ao registrar uso do voucher');
    }
  } catch (error) {
    logger.error('Erro ao registrar uso:', error);
    throw error;
  }
};