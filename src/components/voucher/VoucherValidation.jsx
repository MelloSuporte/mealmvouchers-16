import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import logger from '../../config/logger';
import { logSystemEvent, LOG_TYPES } from '../../utils/systemLogs';
import { findCommonVoucher } from './validators/commonVoucherValidator';
import { 
  findDisposableVoucher, 
  validateDisposableVoucherType, 
  validateDisposableVoucherTime 
} from './validators/disposableVoucherValidator';
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
      
      // Validar tipo de refeição
      const typeValidation = validateDisposableVoucherType(voucherDescartavel, tipoRefeicaoId);
      if (!typeValidation.success) {
        logger.error('Erro na validação do tipo de refeição:', typeValidation.error);
        toast.error(typeValidation.error);
        return typeValidation;
      }

      // Validar horário
      const timeValidation = validateDisposableVoucherTime(voucherDescartavel);
      if (!timeValidation.success) {
        logger.error('Erro na validação do horário:', timeValidation.error);
        toast.error(timeValidation.error);
        return timeValidation;
      }

      // Validar voucher descartável usando RPC
      const { data: validationResult, error: validationError } = await supabase
        .rpc('validate_disposable_voucher', {
          p_codigo: voucherCode,
          p_tipo_refeicao_id: tipoRefeicaoId
        });

      if (validationError) {
        logger.error('Erro na validação do voucher descartável:', validationError);
        toast.error('Erro na validação do voucher descartável: ' + validationError.message);
        return { 
          success: false, 
          error: validationError.message,
          voucherType: 'descartavel'
        };
      }

      if (!validationResult.success) {
        const errorMessage = validationResult.error || 'Erro na validação do voucher';
        logger.error('Falha na validação:', errorMessage);
        toast.error(errorMessage);
        return {
          success: false,
          error: errorMessage,
          voucherType: 'descartavel'
        };
      }

      // Marcar voucher como usado
      const { error: updateError } = await supabase
        .from('vouchers_descartaveis')
        .update({ 
          usado_em: new Date().toISOString(),
          data_uso: new Date().toISOString()
        })
        .eq('codigo', voucherCode)
        .is('usado_em', null);

      if (updateError) {
        logger.error('Erro ao marcar voucher como usado:', updateError);
        toast.error('Erro ao marcar voucher como usado');
        return {
          success: false,
          error: 'Erro ao marcar voucher como usado',
          voucherType: 'descartavel'
        };
      }

      logger.info('Voucher descartável validado com sucesso:', voucherCode);
      toast.success('Voucher descartável validado com sucesso');
      return {
        success: true,
        voucherType: 'descartavel',
        message: validationResult.message || 'Voucher descartável validado com sucesso'
      };
    }

    logger.info('Tipo de voucher não identificado');
    toast.error('Voucher inválido ou não encontrado');
    return { success: false, error: 'Voucher inválido ou não encontrado' };

  } catch (error) {
    logger.error('Erro na validação do voucher:', error);
    await logSystemEvent({
      tipo: LOG_TYPES.ERRO_VALIDACAO_VOUCHER,
      mensagem: 'Erro na validação',
      detalhes: error,
      nivel: 'error'
    });
    const errorMessage = error.message || 'Erro ao validar voucher';
    toast.error(errorMessage);
    return { 
      success: false, 
      error: errorMessage
    };
  }
};