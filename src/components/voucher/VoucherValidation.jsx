import { supabase } from '../../config/supabase';
import logger from '../../config/logger';
import { toast } from "sonner";

export const validateVoucher = async (voucherCode, mealTypeId) => {
  try {
    if (!voucherCode || !mealTypeId) {
      const message = 'Código do voucher e tipo de refeição são obrigatórios';
      logger.error(message);
      throw new Error(message);
    }

    // Primeiro tenta validar como voucher descartável
    const { data: disposableVoucher, error: disposableError } = await supabase
      .from('vouchers_descartaveis')
      .select('*')
      .eq('codigo', voucherCode)
      .is('usado_em', null)
      .maybeSingle();

    if (disposableError) {
      logger.error('Erro ao buscar voucher descartável:', disposableError);
      throw new Error('Erro ao validar voucher descartável');
    }

    if (disposableVoucher) {
      return {
        success: true,
        voucherType: 'descartavel',
        data: disposableVoucher
      };
    }

    // Se não for descartável, tenta validar como voucher comum
    const { data: user, error: userError } = await supabase
      .from('usuarios')
      .select(`
        *,
        turnos (
          id,
          tipo_turno
        )
      `)
      .eq('voucher', voucherCode)
      .maybeSingle();

    if (userError) {
      logger.error('Erro ao buscar usuário:', userError);
      throw new Error('Erro ao validar voucher comum');
    }

    if (user) {
      return {
        success: true,
        voucherType: 'comum',
        user: user
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