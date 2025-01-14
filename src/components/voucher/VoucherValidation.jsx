import { supabase } from '../../config/supabase';
import logger from '../../config/logger';
import { logSystemEvent, LOG_TYPES } from '../../utils/systemLogs';
import { findCommonVoucher } from './validators/commonVoucherValidator';
import { 
  findDisposableVoucher, 
  validateDisposableVoucherType, 
  validateDisposableVoucherTime 
} from './validators/disposableVoucherValidator';

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
        return { 
          success: false, 
          error: validationError.message,
          voucherType: 'comum'
        };
      }

      if (!validationResult.success) {
        return {
          success: false,
          error: validationResult.error || 'Erro na validação do voucher',
          voucherType: 'comum'
        };
      }

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
        return typeValidation;
      }

      // Validar horário
      const timeValidation = validateDisposableVoucherTime(voucherDescartavel);
      if (!timeValidation.success) {
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
        return { 
          success: false, 
          error: validationError.message,
          voucherType: 'descartavel'
        };
      }

      if (!validationResult.success) {
        return {
          success: false,
          error: validationResult.error || 'Erro na validação do voucher',
          voucherType: 'descartavel'
        };
      }

      return {
        success: true,
        voucherType: 'descartavel',
        message: validationResult.message || 'Voucher descartável validado com sucesso'
      };
    }

    logger.info('Tipo de voucher não identificado');
    return { success: false, error: 'Voucher inválido' };

  } catch (error) {
    logger.error('Erro na validação do voucher:', error);
    await logSystemEvent({
      tipo: LOG_TYPES.ERRO_VALIDACAO_VOUCHER,
      mensagem: 'Erro na validação',
      detalhes: error,
      nivel: 'error'
    });
    return { 
      success: false, 
      error: error.message || 'Erro ao validar voucher'
    };
  }
};