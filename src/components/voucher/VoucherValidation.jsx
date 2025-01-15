import React from 'react';
import { supabase } from '../../config/supabase';
import logger from '../../config/logger';
import { logSystemEvent, LOG_TYPES } from '../../utils/systemLogs';
import { findCommonVoucher } from './validators/commonVoucherValidator';
import { findDisposableVoucher } from './validators/disposableVoucherValidator';
import { validateAndUseDisposableVoucher } from './validators/disposableVoucherService';
import { toast } from "sonner";

export const validateVoucher = async (codigo, tipoRefeicaoId) => {
  try {
    await logSystemEvent({
      tipo: LOG_TYPES.TENTATIVA_VALIDACAO,
      mensagem: `Iniciando validação do voucher: ${codigo}`,
      detalhes: { codigo, tipoRefeicaoId }
    });

    logger.info('Iniciando validação do voucher:', codigo);

    // Garantir que o código seja uma string
    const voucherCode = String(codigo);
    
    // Tentar validar como voucher comum
    const { data: usuario, error: userError } = await findCommonVoucher(voucherCode);

    if (usuario) {
      logger.info('Voucher identificado como comum');
      
      // Validar voucher comum usando RPC
      const { data: validationResult, error: validationError } = await supabase
        .rpc('validate_and_use_voucher', {
          p_codigo: voucherCode,
          p_tipo_refeicao_id: tipoRefeicaoId
        });

      if (validationError) {
        logger.error('Erro na validação do voucher comum:', validationError);
        toast.error('Erro na validação do voucher comum: ' + validationError.message);
        return { 
          success: false, 
          error: validationError.message,
          voucherType: 'comum'
        };
      }

      if (!validationResult.success) {
        toast.error(validationResult.error || 'Erro na validação do voucher');
        return {
          success: false,
          error: validationResult.error || 'Erro na validação do voucher',
          voucherType: 'comum'
        };
      }

      toast.success('Voucher comum validado com sucesso');
      return {
        success: true,
        voucherType: 'comum',
        user: usuario,
        message: validationResult.message || 'Voucher comum validado com sucesso'
      };
    }

    // Se não for comum, tentar como descartável
    const { data: voucherDescartavel, error: descartavelError } = await findDisposableVoucher(voucherCode);

    if (voucherDescartavel) {
      logger.info('Voucher identificado como descartável');
      
      const result = await validateAndUseDisposableVoucher(voucherDescartavel, tipoRefeicaoId);
      
      if (!result.success) {
        toast.error(result.error);
        return result;
      }

      toast.success(result.message);
      return {
        ...result,
        shouldNavigate: true
      };
    }

    const notFoundMsg = 'Voucher inválido ou não encontrado';
    logger.info('Tipo de voucher não identificado');
    toast.error(notFoundMsg);
    return { success: false, error: notFoundMsg };

  } catch (error) {
    logger.error('Erro na validação do voucher:', error);
    await logSystemEvent({
      tipo: LOG_TYPES.ERRO_VALIDACAO_VOUCHER,
      mensagem: 'Erro na validação',
      detalhes: error,
      nivel: 'error'
    });
    const errorMsg = error.message || 'Erro ao validar voucher';
    toast.error(errorMsg);
    return { 
      success: false, 
      error: errorMsg
    };
  }
};