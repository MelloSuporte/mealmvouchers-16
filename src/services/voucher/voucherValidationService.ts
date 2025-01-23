import { supabase } from '../../config/supabase';
import logger from '../../config/logger';
import { validateCommonVoucherRules } from './validators/commonVoucherRules';
import { validateDisposableVoucher } from './validators/disposableVoucherValidator';
import { validateCommonVoucher } from './validators/commonVoucherValidator';

export const validateVoucher = async (codigo: string, tipoRefeicaoId: string) => {
  try {
    logger.info('Iniciando validação do voucher:', { codigo, tipoRefeicaoId });
    
    // Buscar usuário pelo voucher
    const { data: user, error: userError } = await supabase
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
          tipo_turno,
          horario_inicio,
          horario_fim,
          ativo
        )
      `)
      .eq('voucher', codigo)
      .maybeSingle();

    if (userError) {
      logger.error('Erro ao buscar usuário:', userError);
      throw userError;
    }

    // Se encontrado como voucher comum
    if (user) {
      logger.info('Voucher comum encontrado:', user);

      if (user.suspenso) {
        return { success: false, error: 'Usuário suspenso' };
      }

      if (!user.empresas?.ativo) {
        return { success: false, error: 'Empresa inativa' };
      }

      if (!user.turnos?.ativo) {
        return { success: false, error: 'Turno inativo' };
      }

      // Aplicar regras de validação
      const isValid = await validateCommonVoucherRules({
        userId: user.id,
        mealTypeId: tipoRefeicaoId,
        shiftId: user.turno_id
      });

      if (!isValid) {
        return { success: false, error: 'Validação falhou' };
      }

      return {
        success: true,
        voucherType: 'comum',
        user: user
      };
    }

    // Se não encontrado como voucher comum, tenta validar como voucher descartável
    const { data: disposableVoucher, error: disposableError } = await supabase
      .from('vouchers_descartaveis')
      .select('*')
      .eq('codigo', codigo)
      .is('usado_em', null)
      .maybeSingle();

    if (disposableError) {
      logger.error('Erro ao buscar voucher descartável:', disposableError);
      throw disposableError;
    }

    if (disposableVoucher) {
      return await validateDisposableVoucher(codigo, tipoRefeicaoId);
    }

    // Se não encontrado como voucher comum ou descartável, tenta validar como voucher comum
    const commonValidationResult = await validateCommonVoucher(codigo, tipoRefeicaoId);
    return commonValidationResult;

  } catch (error) {
    logger.error('Erro na validação:', error);
    return { 
      success: false, 
      error: error.message || 'Erro ao validar voucher'
    };
  }
};
