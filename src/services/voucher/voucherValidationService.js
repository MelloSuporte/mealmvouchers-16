import { validateCommonVoucher } from '../../components/voucher/validators/commonVoucherValidator';
import { validateDisposableVoucher } from '../../components/voucher/validators/disposableVoucherValidator';
import logger from '../../config/logger';

export const validateVoucher = async (code, tipoRefeicaoId) => {
  try {
    logger.info('Iniciando validação do voucher:', code);

    // Primeiro tenta validar como voucher descartável
    const disposableResult = await validateDisposableVoucher(code, tipoRefeicaoId);
    if (disposableResult.success) {
      return disposableResult;
    }

    // Se não for descartável, tenta validar como voucher comum
    const commonResult = await validateCommonVoucher(code, tipoRefeicaoId);
    return commonResult;

  } catch (error) {
    logger.error('Erro na validação do voucher:', error);
    return { 
      success: false, 
      error: error.message || 'Erro ao validar voucher'
    };
  }
};

// Re-export the imported functions so they can be used by other components
export { validateCommonVoucher, validateDisposableVoucher };

// Export validateVoucherTime function
export const validateVoucherTime = async (tipoRefeicaoId) => {
  try {
    const { data, error } = await supabase
      .rpc('validate_meal_time', {
        p_tipo_refeicao_id: tipoRefeicaoId
      });

    if (error) {
      logger.error('Erro ao validar horário:', error);
      throw error;
    }

    return data;
  } catch (error) {
    logger.error('Erro ao validar horário:', error);
    throw error;
  }
};