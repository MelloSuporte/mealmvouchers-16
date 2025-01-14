import { supabase } from '../../config/supabase';
import logger from '../../config/logger';
import { logSystemEvent, LOG_TYPES } from '../../utils/systemLogs';

const findCommonVoucher = async (codigo) => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select(`
        id,
        nome,
        cpf,
        turno_id,
        empresa_id,
        empresas (
          nome,
          ativo
        ),
        turnos (
          tipo_turno,
          horario_inicio,
          horario_fim
        )
      `)
      .eq('voucher', codigo)
      .maybeSingle();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    logger.error('Erro ao buscar voucher comum:', error);
    return { data: null, error };
  }
};

const findDisposableVoucher = async (codigo) => {
  try {
    logger.info('Buscando voucher descartável:', codigo);
    
    const { data, error } = await supabase
      .from('vouchers_descartaveis')
      .select(`
        id,
        codigo,
        tipo_refeicao_id,
        data_expiracao,
        usado_em,
        data_uso
      `)
      .eq('codigo', codigo)
      .is('usado_em', null)
      .gte('data_expiracao', new Date().toISOString().split('T')[0])
      .maybeSingle();

    if (error) {
      logger.error('Erro na consulta do voucher descartável:', error);
      throw error;
    }

    if (!data) {
      logger.info('Voucher descartável não encontrado ou expirado:', codigo);
    } else {
      logger.info('Voucher descartável encontrado:', data);
    }

    return { data, error: null };
  } catch (error) {
    logger.error('Erro ao buscar voucher descartável:', error);
    return { data: null, error };
  }
};

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