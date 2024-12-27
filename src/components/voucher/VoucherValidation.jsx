import { useState } from 'react';
import { supabase } from '../../config/supabase';
import { logSystemEvent, LOG_TYPES } from '../../utils/systemLogs';
import logger from '../../config/logger';

export const validateVoucher = async (codigo, tipoRefeicaoId) => {
  try {
    // Log da tentativa de validação
    await logSystemEvent({
      tipo: LOG_TYPES.TENTATIVA_VALIDACAO,
      mensagem: `Iniciando validação do voucher: ${codigo}`,
      detalhes: { codigo, tipoRefeicaoId }
    });

    // Validação do voucher descartável
    logger.info('Iniciando validação detalhada do voucher descartável:', codigo);
    const { data: voucherDescartavel, error: errorDescartavel } = await supabase
      .from('vouchers_descartaveis')
      .select('*')
      .eq('codigo', codigo)
      .single();

    if (errorDescartavel) {
      await logSystemEvent({
        tipo: LOG_TYPES.ERRO_VALIDACAO_VOUCHER,
        mensagem: 'Erro ao consultar voucher descartável',
        detalhes: errorDescartavel,
        nivel: 'error'
      });
      throw errorDescartavel;
    }

    if (voucherDescartavel) {
      // Log do resultado da validação
      await logSystemEvent({
        tipo: LOG_TYPES.VALIDACAO_VOUCHER,
        mensagem: 'Voucher descartável encontrado',
        detalhes: voucherDescartavel
      });
      return { success: true, voucher: voucherDescartavel };
    }

    // Validação do voucher comum
    logger.info('Validando voucher comum:', codigo);
    const { data: usuario, error: errorUsuario } = await supabase
      .from('usuarios')
      .select('*, empresas(*), turnos(*)')
      .eq('voucher', codigo)
      .single();

    if (errorUsuario) {
      await logSystemEvent({
        tipo: LOG_TYPES.ERRO_VALIDACAO_VOUCHER,
        mensagem: 'Erro ao consultar usuário',
        detalhes: errorUsuario,
        nivel: 'error'
      });
      throw errorUsuario;
    }

    if (usuario) {
      // Log do sucesso da validação
      await logSystemEvent({
        tipo: LOG_TYPES.VALIDACAO_SUCESSO,
        mensagem: 'Voucher comum válido',
        detalhes: usuario
      });
      return { success: true, user: usuario };
    }

    // Log de falha na validação
    await logSystemEvent({
      tipo: LOG_TYPES.VALIDACAO_FALHA,
      mensagem: 'Voucher não encontrado',
      detalhes: { codigo }
    });

    return { success: false, error: 'Voucher inválido' };
  } catch (error) {
    // Log de erro na validação
    await logSystemEvent({
      tipo: LOG_TYPES.ERRO_VALIDACAO_VOUCHER,
      mensagem: 'Erro na validação',
      detalhes: error,
      nivel: 'error'
    });
    
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