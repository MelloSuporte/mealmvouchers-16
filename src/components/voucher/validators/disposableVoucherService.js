import { supabase } from '../../../config/supabase';
import logger from '../../../config/logger';
import { toast } from "sonner";

export const validateAndUseDisposableVoucher = async (voucher, tipoRefeicaoId) => {
  try {
    if (!voucher || !tipoRefeicaoId) {
      throw new Error('Voucher e tipo de refeição são obrigatórios');
    }

    logger.info('Validando voucher descartável:', voucher);

    const { data, error } = await supabase
      .rpc('validate_and_use_disposable_voucher', {
        p_voucher_id: voucher.id,
        p_tipo_refeicao_id: tipoRefeicaoId
      });

    if (error) {
      logger.error('Erro ao validar voucher descartável:', error);
      toast.error(error.message || 'Erro ao validar voucher');
      return { success: false, error: error.message };
    }

    if (!data.success) {
      toast.error(data.error || 'Erro ao validar voucher');
      return data;
    }

    toast.success('Voucher validado com sucesso');
    return data;

  } catch (error) {
    logger.error('Erro ao validar voucher descartável:', error);
    toast.error(error.message || 'Erro ao validar voucher');
    return { 
      success: false, 
      error: error.message || 'Erro ao validar voucher descartável'
    };
  }
};