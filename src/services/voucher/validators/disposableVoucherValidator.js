import { supabase } from '../../../config/supabase';
import logger from '../../../config/logger';

export const findDisposableVoucher = async (code) => {
  try {
    logger.info('Buscando voucher descartável:', code);
    
    // Primeiro buscar qualquer voucher com este código, independente de usado ou não
    const { data, error } = await supabase
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
      .eq('codigo', code)
      .maybeSingle();

    if (error) {
      logger.error('Erro ao buscar voucher descartável:', error);
      throw error;
    }

    // Se não encontrou nenhum voucher
    if (!data) {
      logger.info('Voucher descartável não encontrado:', code);
      return { data: null, error: 'Voucher não encontrado ou inválido' };
    }

    // Se encontrou o voucher mas já foi usado
    if (data.usado_em) {
      logger.info('Voucher descartável já utilizado:', code);
      return { data: null, error: 'Voucher descartável já utilizado' };
    }

    logger.info('Voucher descartável encontrado:', data);
    return { data };
  } catch (error) {
    logger.error('Erro ao buscar voucher descartável:', error);
    throw error;
  }
};

export const validateDisposableVoucher = async (code, tipoRefeicaoId) => {
  try {
    const result = await findDisposableVoucher(code);
    
    if (!result.data) {
      return { success: false, error: result.error };
    }

    const voucher = result.data;

    // Validate if voucher matches the meal type
    if (voucher.tipo_refeicao_id !== tipoRefeicaoId) {
      logger.warn('Tipo de refeição não corresponde:', {
        voucher: voucher.tipo_refeicao_id,
        requested: tipoRefeicaoId
      });
      return { 
        success: false, 
        error: 'Este voucher não é válido para este tipo de refeição' 
      };
    }

    // Validate expiration
    const today = new Date();
    const expirationDate = new Date(voucher.data_expiracao);
    
    if (today > expirationDate) {
      return { success: false, error: 'Voucher expirado' };
    }

    // Validate meal time with tolerance
    const mealType = voucher.tipos_refeicao;
    const currentTime = new Date();
    const [startHour, startMinute] = mealType.horario_inicio.split(':');
    const [endHour, endMinute] = mealType.horario_fim.split(':');
    
    const startTime = new Date();
    startTime.setHours(parseInt(startHour), parseInt(startMinute), 0);
    
    const endTime = new Date();
    endTime.setHours(parseInt(endHour), parseInt(endMinute), 0);
    endTime.setMinutes(endTime.getMinutes() + (mealType.minutos_tolerancia || 0));

    if (currentTime < startTime || currentTime > endTime) {
      return {
        success: false,
        error: `Esta refeição só pode ser utilizada entre ${mealType.horario_inicio} e ${mealType.horario_fim} (tolerância de ${mealType.minutos_tolerancia} minutos)`
      };
    }

    logger.info('Voucher descartável válido:', voucher);
    return {
      success: true,
      data: voucher,
      message: 'Voucher válido'
    };

  } catch (error) {
    logger.error('Erro ao validar voucher descartável:', error);
    return {
      success: false,
      error: error.message || 'Erro ao validar voucher descartável'
    };
  }
};

export const useDisposableVoucher = async (code, tipoRefeicaoId) => {
  try {
    // First validate the voucher
    const validationResult = await validateDisposableVoucher(code, tipoRefeicaoId);
    if (!validationResult.success) {
      return validationResult;
    }

    const voucher = validationResult.data;
    const now = new Date().toISOString();

    // Update only vouchers_descartaveis table
    const { error: updateError } = await supabase
      .from('vouchers_descartaveis')
      .update({
        usado_em: now,
        data_uso: now
      })
      .eq('id', voucher.id)
      .is('usado_em', null);

    if (updateError) {
      logger.error('Erro ao marcar voucher como usado:', updateError);
      return {
        success: false,
        error: 'Erro ao registrar uso do voucher'
      };
    }

    logger.info('Voucher descartável usado com sucesso:', {
      id: voucher.id,
      code: code,
      tipoRefeicaoId: tipoRefeicaoId
    });

    return {
      success: true,
      data: voucher,
      message: 'Voucher utilizado com sucesso'
    };

  } catch (error) {
    logger.error('Erro ao usar voucher descartável:', error);
    return {
      success: false,
      error: error.message || 'Erro ao processar voucher'
    };
  }
};