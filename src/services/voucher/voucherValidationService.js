import { supabase } from '../../config/supabase';
import logger from '../../config/logger';

export const validateVoucher = async (codigo, tipoRefeicaoId) => {
  try {
    logger.info('Iniciando validação do voucher:', { codigo, tipoRefeicaoId });
    
    // First try to find as common voucher
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

    // If found as common voucher
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

      // Registrar uso do voucher comum
      const { error: usageError } = await supabase
        .from('uso_voucher')
        .insert({
          usuario_id: user.id,
          tipo_refeicao_id: tipoRefeicaoId,
          usado_em: new Date().toISOString(),
          tipo_voucher: 'comum'
        });

      if (usageError) {
        logger.error('Erro ao registrar uso do voucher comum:', usageError);
        throw usageError;
      }

      return {
        success: true,
        voucherType: 'comum',
        user: user
      };
    }

    // If not found as common voucher, try disposable
    const { data: disposableVoucher, error: disposableError } = await supabase
      .from('vouchers_descartaveis')
      .select(`
        *,
        tipos_refeicao (
          id,
          nome,
          horario_inicio,
          horario_fim,
          minutos_tolerancia,
          ativo
        )
      `)
      .eq('codigo', codigo)
      .is('usado_em', null)
      .maybeSingle();

    if (disposableError) {
      logger.error('Erro ao buscar voucher descartável:', disposableError);
      throw disposableError;
    }

    if (disposableVoucher) {
      logger.info('Voucher descartável encontrado:', disposableVoucher);

      // Verificar se o tipo de refeição corresponde
      if (disposableVoucher.tipo_refeicao_id !== tipoRefeicaoId) {
        return {
          success: false,
          error: 'Tipo de refeição não corresponde ao voucher'
        };
      }

      // Marcar voucher descartável como usado
      const { error: updateError } = await supabase
        .from('vouchers_descartaveis')
        .update({
          usado_em: new Date().toISOString(),
          data_uso: new Date().toISOString()
        })
        .eq('id', disposableVoucher.id)
        .is('usado_em', null); // Garantir que não foi usado entre a validação e atualização

      if (updateError) {
        logger.error('Erro ao atualizar voucher descartável:', updateError);
        throw updateError;
      }

      // Registrar uso do voucher descartável
      const { error: usageError } = await supabase
        .from('uso_voucher')
        .insert({
          tipo_refeicao_id: tipoRefeicaoId,
          usado_em: new Date().toISOString(),
          tipo_voucher: 'descartavel',
          voucher_descartavel_id: disposableVoucher.id
        });

      if (usageError) {
        logger.error('Erro ao registrar uso do voucher descartável:', usageError);
        throw usageError;
      }

      return {
        success: true,
        voucherType: 'descartavel',
        data: disposableVoucher
      };
    }

    return {
      success: false,
      error: 'Voucher não encontrado ou inválido'
    };

  } catch (error) {
    logger.error('Erro na validação:', error);
    return { 
      success: false, 
      error: error.message || 'Erro ao validar voucher'
    };
  }
};