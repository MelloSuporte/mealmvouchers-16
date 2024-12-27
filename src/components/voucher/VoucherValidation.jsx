import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import logger from '../../config/logger';
import { supabase } from '../../config/supabase';
import { registerVoucherUsage } from '../../services/voucher/voucherUsageService';

export const validateVoucher = async (voucherCode, mealType) => {
  try {
    logger.info('Iniciando validação do voucher:', voucherCode);

    // Log da tentativa de validação
    await supabase
      .from('logs_sistema')
      .insert({
        tipo: 'TENTATIVA_VALIDACAO',
        mensagem: `Iniciando validação do voucher: ${voucherCode}`,
        nivel: 'info',
        detalhes: {
          codigo: voucherCode,
          tipoRefeicaoId: mealType
        }
      });

    // Buscar o voucher
    const { data: voucher, error: voucherError } = await supabase
      .from('vouchers_descartaveis')
      .select('*')
      .eq('codigo', voucherCode)
      .single();

    if (voucherError) {
      throw new Error('Voucher não encontrado ou inválido');
    }

    // Registrar o uso do voucher
    const result = await registerVoucherUsage(
      voucher.usuario_id,
      mealType,
      'descartavel',
      voucher.id
    );

    if (!result) {
      throw new Error('Erro ao registrar uso do voucher');
    }

    return { success: true };
  } catch (error) {
    // Log do erro de validação
    await supabase
      .from('logs_sistema')
      .insert({
        tipo: 'ERRO_VALIDACAO_VOUCHER',
        mensagem: 'Erro na validação',
        nivel: 'error',
        detalhes: {
          message: error.message,
          code: error.code || '',
          details: error.details || '',
          hint: error.hint || ''
        }
      });

    logger.error('Erro na validação do voucher:', error);
    throw error;
  }
};
