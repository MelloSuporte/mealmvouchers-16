import { supabase } from '../../../config/supabase';
import logger from '../../../config/logger';

export const validateDisposableVoucher = async (codigo, tipoRefeicaoId) => {
  try {
    logger.info('Iniciando validação detalhada do voucher descartável:', codigo);

    const { data: voucher, error } = await supabase
      .from('vouchers_descartaveis')
      .select('*, tipos_refeicao(*)')
      .eq('codigo', String(codigo))
      .single();

    if (error || !voucher) {
      logger.info('Voucher não encontrado ou já utilizado');
      return { success: false, error: 'Voucher descartável inválido ou já utilizado' };
    }

    // Verificar se já foi usado
    if (voucher.usado_em) {
      return { success: false, error: 'Voucher descartável já utilizado' };
    }

    // Verificar validade
    if (new Date(voucher.data_expiracao) < new Date()) {
      return { success: false, error: 'Voucher descartável expirado' };
    }

    // Verificar tipo de refeição
    if (voucher.tipo_refeicao_id !== tipoRefeicaoId) {
      return { success: false, error: 'Tipo de refeição inválido para este voucher' };
    }

    return { success: true, voucher };
  } catch (error) {
    logger.error('Erro ao validar voucher descartável:', error);
    throw error;
  }
};