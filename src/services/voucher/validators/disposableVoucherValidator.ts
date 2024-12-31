import { supabase } from '../../../config/supabase';
import logger from '../../../config/logger';
import { validateMealTime } from './mealTimeValidator';

export const validateDisposableVoucher = async (codigo: string, tipoRefeicaoId: string) => {
  try {
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
      .eq('codigo', String(codigo))
      .eq('tipo_refeicao_id', tipoRefeicaoId)
      .is('usado_em', null)
      .is('data_uso', null)
      .gte('data_expiracao', new Date().toISOString())
      .maybeSingle();

    if (error) {
      logger.error('Erro ao buscar voucher descartável:', error);
      return { success: false, error: 'Erro ao validar voucher descartável' };
    }

    if (!voucher) {
      return { success: false, error: 'Voucher não encontrado ou já utilizado' };
    }

    // Verificar tipo de refeição
    if (!voucher.tipos_refeicao?.ativo) {
      return { success: false, error: 'Tipo de refeição inativo' };
    }

    // Validar horário da refeição
    const timeValidation = validateMealTime(voucher.tipos_refeicao);
    if (!timeValidation.success) {
      return timeValidation;
    }

    return { success: true, voucher };
  } catch (error) {
    logger.error('Erro ao validar voucher descartável:', error);
    throw error;
  }
};