import { supabase } from '../../config/supabase';
import logger from '../../config/logger';
import { validateCommonVoucher } from '../../components/voucher/validators/commonVoucherValidator';
import { validateDisposableVoucher } from '../../components/voucher/validators/disposableVoucherValidator';

export const validateVoucher = async (codigo, tipoRefeicaoId) => {
  try {
    logger.info('Iniciando validação do voucher:', { codigo, tipoRefeicaoId });
    
    // First validate if meal type exists and is active
    if (!tipoRefeicaoId) {
      return { success: false, error: 'Tipo de refeição não fornecido' };
    }

    const { data: mealType, error: mealTypeError } = await supabase
      .from('tipos_refeicao')
      .select('*')
      .eq('id', tipoRefeicaoId)
      .eq('ativo', true)
      .single();

    if (mealTypeError || !mealType) {
      logger.error('Erro ao validar tipo de refeição:', mealTypeError);
      return { success: false, error: 'Tipo de refeição não encontrado ou inativo' };
    }

    // Try disposable voucher first
    const disposableResult = await validateDisposableVoucher(codigo, tipoRefeicaoId);
    if (disposableResult.success) {
      return disposableResult;
    }

    // If not disposable, try common voucher
    const commonResult = await validateCommonVoucher(codigo, tipoRefeicaoId);
    return commonResult;

  } catch (error) {
    logger.error('Erro na validação:', error);
    return { 
      success: false, 
      error: error.message || 'Erro ao validar voucher'
    };
  }
};

export const validateVoucherTime = async (tipoRefeicaoId) => {
  try {
    if (!tipoRefeicaoId) {
      throw new Error('ID do tipo de refeição é obrigatório');
    }

    const { data: mealType, error: mealTypeError } = await supabase
      .from('tipos_refeicao')
      .select('*')
      .eq('id', tipoRefeicaoId)
      .eq('ativo', true)
      .single();

    if (mealTypeError || !mealType) {
      logger.error('Erro ao validar horário - tipo de refeição não encontrado:', mealTypeError);
      throw new Error('Tipo de refeição não encontrado ou inativo');
    }

    const currentTime = new Date();
    const [startHour, startMinute] = mealType.horario_inicio.split(':');
    const [endHour, endMinute] = mealType.horario_fim.split(':');
    
    const startTime = new Date();
    startTime.setHours(parseInt(startHour), parseInt(startMinute), 0);
    
    const endTime = new Date();
    endTime.setHours(parseInt(endHour), parseInt(endMinute), 0);
    endTime.setMinutes(endTime.getMinutes() + mealType.minutos_tolerancia);

    const isWithinTime = currentTime >= startTime && currentTime <= endTime;

    return {
      success: isWithinTime,
      error: isWithinTime ? null : `Esta refeição só pode ser utilizada entre ${mealType.horario_inicio} e ${mealType.horario_fim}`
    };
  } catch (error) {
    logger.error('Erro ao validar horário:', error);
    throw error;
  }
};

export { validateCommonVoucher, validateDisposableVoucher };