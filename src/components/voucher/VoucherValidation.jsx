import { supabase } from '../../config/supabase';
import logger from '../../config/logger';
import { toast } from "sonner";

export const validateVoucher = async (voucherCode, mealTypeId) => {
  try {
    logger.info('Iniciando validação do voucher:', { voucherCode, mealTypeId });

    // Verificar se o tipo de refeição está ativo e dentro do horário permitido
    const { data: mealType, error: mealTypeError } = await supabase
      .from('tipos_refeicao')
      .select('*')
      .eq('id', mealTypeId)
      .eq('ativo', true)
      .single();

    if (mealTypeError) {
      logger.error('Erro ao buscar tipo de refeição:', mealTypeError);
      throw new Error('Erro ao validar tipo de refeição');
    }

    if (!mealType) {
      logger.warn('Tipo de refeição não encontrado ou inativo');
      throw new Error('Tipo de refeição inválido ou inativo');
    }

    // Validar horário da refeição
    const currentTime = new Date().toLocaleTimeString('pt-BR', { hour12: false });
    const startTime = mealType.horario_inicio;
    const endTime = mealType.horario_fim;
    const toleranceMinutes = mealType.minutos_tolerancia || 0;

    // Converter horários para minutos para facilitar comparação
    const currentMinutes = timeToMinutes(currentTime);
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime) + toleranceMinutes;

    if (currentMinutes < startMinutes || currentMinutes > endMinutes) {
      const message = `Esta refeição só pode ser utilizada entre ${startTime} e ${endTime} (tolerância de ${toleranceMinutes} minutos)`;
      logger.warn('Tentativa de uso fora do horário:', message);
      throw new Error(message);
    }

    // Primeiro tenta validar como voucher descartável
    const { data: disposableVoucher } = await supabase
      .from('vouchers_descartaveis')
      .select('*')
      .eq('codigo', voucherCode)
      .is('usado_em', null)
      .single();

    if (disposableVoucher) {
      return {
        success: true,
        voucherType: 'descartavel',
        data: disposableVoucher
      };
    }

    // Se não for descartável, tenta validar como voucher comum
    const { data: user } = await supabase
      .from('usuarios')
      .select(`
        *,
        turnos (
          id,
          tipo_turno
        )
      `)
      .eq('voucher', voucherCode)
      .single();

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

// Função auxiliar para converter horário em minutos
const timeToMinutes = (time) => {
  if (!time) return 0;
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};