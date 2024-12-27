import { supabase } from '../../config/supabase';
import logger from '../../config/logger';
import { VOUCHER_TYPES } from './voucherTypes';
import { findVoucherComum, findVoucherExtra, findVoucherDescartavel } from './voucherQueries';

export const validateVoucherTime = async (tipoRefeicaoId, turnoId) => {
  try {
    const { data, error } = await supabase.rpc('check_meal_time_and_shift', {
      p_tipo_refeicao_id: tipoRefeicaoId,
      p_turno_id: turnoId
    });

    if (error) throw error;
    return data;
  } catch (error) {
    logger.error('Erro ao validar horário:', error);
    throw new Error('Erro ao validar horário do voucher');
  }
};

export const validateVoucherUsage = async (userId, tipoRefeicaoId) => {
  try {
    // Verificar uso no dia
    const today = new Date().toISOString().split('T')[0];
    const { data: usosHoje, error: errorUsos } = await supabase
      .from('uso_voucher')
      .select('*')
      .eq('usuario_id', userId)
      .gte('usado_em', today);

    if (errorUsos) throw errorUsos;

    // Máximo 2 vouchers por turno
    if (usosHoje?.length >= 2) {
      throw new Error('Limite de vouchers por turno atingido');
    }

    // Verificar mesmo tipo de refeição
    const mesmoTipo = usosHoje?.find(uso => uso.tipo_refeicao_id === tipoRefeicaoId);
    if (mesmoTipo) {
      throw new Error('Você já utilizou um voucher para este tipo de refeição hoje');
    }

    // Verificar intervalo mínimo de 2 horas
    if (usosHoje?.length > 0) {
      const ultimoUso = new Date(usosHoje[usosHoje.length - 1].usado_em);
      const agora = new Date();
      const diffHoras = (agora - ultimoUso) / (1000 * 60 * 60);
      
      if (diffHoras < 2) {
        throw new Error('É necessário aguardar 2 horas entre refeições');
      }
    }

    return true;
  } catch (error) {
    logger.error('Erro na validação de uso:', error);
    throw error;
  }
};

export const registerVoucherUsage = async (userId, tipoRefeicaoId, voucherType, voucherId = null) => {
  try {
    const usageData = {
      usuario_id: userId,
      tipo_refeicao_id: tipoRefeicaoId,
      usado_em: new Date().toISOString()
    };

    if (voucherType === VOUCHER_TYPES.EXTRA) {
      usageData.voucher_extra_id = voucherId;
    } else if (voucherType === VOUCHER_TYPES.DESCARTAVEL) {
      usageData.voucher_descartavel_id = voucherId;
    }

    const { error: usageError } = await supabase
      .from('uso_voucher')
      .insert([usageData]);

    if (usageError) throw usageError;

    // Atualizar status do voucher se necessário
    if (voucherType === VOUCHER_TYPES.EXTRA) {
      const { error: updateError } = await supabase
        .from('vouchers_extras')
        .update({ usado_em: new Date().toISOString() })
        .eq('id', voucherId);

      if (updateError) throw updateError;
    } else if (voucherType === VOUCHER_TYPES.DESCARTAVEL) {
      const { error: updateError } = await supabase
        .from('vouchers_descartaveis')
        .update({ usado_em: new Date().toISOString() })
        .eq('id', voucherId);

      if (updateError) throw updateError;
    }

    return true;
  } catch (error) {
    logger.error('Erro ao registrar uso:', error);
    throw error;
  }
};