import { supabase } from '../../../config/supabase';
import logger from '../../../config/logger';

export const validateDisposableVoucher = async (codigo: string, tipoRefeicaoId: string) => {
  try {
    logger.info('Iniciando validação detalhada do voucher descartável:', { codigo, tipoRefeicaoId });

    // Buscar voucher com informações do tipo de refeição
    const { data: voucher, error } = await supabase
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
      .eq('tipo_refeicao_id', tipoRefeicaoId)
      .is('usado_em', null)
      .gte('data_expiracao', new Date().toISOString().split('T')[0])
      .maybeSingle();

    if (error) {
      logger.error('Erro ao buscar voucher descartável:', error);
      return { success: false, error: 'Erro ao validar voucher descartável' };
    }

    if (!voucher) {
      logger.info('Voucher não encontrado ou já utilizado:', { codigo });
      return { success: false, error: 'Voucher não encontrado ou já utilizado' };
    }

    // Verificar tipo de refeição
    if (!voucher.tipos_refeicao?.ativo) {
      logger.info('Tipo de refeição inativo:', { tipoRefeicaoId });
      return { success: false, error: 'Tipo de refeição inativo' };
    }

    // Verificar horário da refeição
    const { data: timeValidation, error: timeError } = await supabase
      .rpc('validate_meal_time', {
        p_tipo_refeicao_id: tipoRefeicaoId
      });

    if (timeError || !timeValidation) {
      logger.error('Erro ao validar horário:', timeError);
      return { success: false, error: 'Erro ao validar horário da refeição' };
    }

    if (!timeValidation.is_valid) {
      return { 
        success: false, 
        error: timeValidation.message || 'Fora do horário permitido para esta refeição'
      };
    }

    // Marcar voucher como usado com timestamp atual
    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from('vouchers_descartaveis')
      .update({
        usado_em: now,
        data_uso: now,
        usado: true
      })
      .eq('id', voucher.id)
      .is('usado_em', null);

    if (updateError) {
      logger.error('Erro ao marcar voucher como usado:', updateError);
      return { success: false, error: 'Erro ao marcar voucher como usado' };
    }

    // Registrar uso do voucher na tabela uso_voucher
    const { error: usageError } = await supabase
      .from('uso_voucher')
      .insert({
        voucher_descartavel_id: voucher.id,
        tipo_refeicao_id: tipoRefeicaoId,
        usado_em: now,
        tipo_voucher: 'descartavel'
      });

    if (usageError) {
      logger.error('Erro ao registrar uso do voucher:', usageError);
      return { success: false, error: 'Erro ao registrar uso do voucher' };
    }

    logger.info('Voucher validado com sucesso:', { 
      codigo,
      usado_em: now,
      data_uso: now
    });
    
    return { 
      success: true, 
      message: 'Voucher validado com sucesso',
      voucher
    };
  } catch (error) {
    logger.error('Erro ao validar voucher descartável:', error);
    return { success: false, error: 'Erro ao validar voucher descartável' };
  }
};