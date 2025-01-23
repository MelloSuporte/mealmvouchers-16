import { supabase } from '@/config/supabase';
import logger from '@/config/logger';
import { toast } from "sonner";
import { addMinutes, isWithinInterval, parse } from 'date-fns';

interface DisposableVoucherValidationResult {
  success: boolean;
  error?: string;
  data?: any;
}

export const validateDisposableVoucher = async (
  code: string,
  mealTypeId: string
): Promise<DisposableVoucherValidationResult> => {
  try {
    logger.info('Validando voucher descartável:', { code, mealTypeId });

    // 1. Verificar se o voucher existe e não foi usado
    const { data: voucher, error: voucherError } = await supabase
      .from('vouchers_descartaveis')
      .select(`
        *,
        tipos_refeicao (
          nome,
          horario_inicio,
          horario_fim,
          minutos_tolerancia,
          ativo
        )
      `)
      .eq('codigo', code)
      .is('usado_em', null)
      .single();

    if (voucherError || !voucher) {
      logger.warn('Voucher não encontrado ou já utilizado:', code);
      return {
        success: false,
        error: 'Voucher não encontrado ou já utilizado'
      };
    }

    // 2. Verificar data de expiração
    const today = new Date();
    const expirationDate = new Date(voucher.data_expiracao);
    
    if (today > expirationDate) {
      logger.warn('Voucher expirado:', {
        expiration: voucher.data_expiracao,
        now: today
      });
      return {
        success: false,
        error: 'Voucher expirado'
      };
    }

    // 3. Verificar tipo de refeição e horário
    if (voucher.tipo_refeicao_id !== mealTypeId) {
      return {
        success: false,
        error: 'Tipo de refeição inválido para este voucher'
      };
    }

    const mealType = voucher.tipos_refeicao;
    if (!mealType.ativo) {
      return {
        success: false,
        error: 'Tipo de refeição inativo'
      };
    }

    // 4. Validar horário da refeição com tolerância
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

    // 5. Verificar limite diário de refeições (2 por dia)
    const today_start = new Date();
    today_start.setHours(0, 0, 0, 0);
    
    const { data: usageToday, error: usageError } = await supabase
      .from('uso_voucher')
      .select('*')
      .eq('voucher_descartavel_id', voucher.id)
      .gte('usado_em', today_start.toISOString())
      .order('usado_em', { ascending: false });

    if (usageError) {
      logger.error('Erro ao verificar uso do voucher:', usageError);
      throw usageError;
    }

    if (usageToday && usageToday.length >= 2) {
      return {
        success: false,
        error: 'Limite diário de refeições atingido (máximo 2)'
      };
    }

    // 6. Verificar intervalo mínimo entre refeições (1 hora)
    if (usageToday && usageToday.length > 0) {
      const lastUsage = new Date(usageToday[0].usado_em);
      const minInterval = new Date(lastUsage.getTime() + (60 * 60 * 1000)); // 1 hora em milissegundos

      if (currentTime < minInterval) {
        const minutesRemaining = Math.ceil((minInterval.getTime() - currentTime.getTime()) / (1000 * 60));
        return {
          success: false,
          error: `Intervalo mínimo entre refeições não respeitado. Aguarde ${minutesRemaining} minutos.`
        };
      }
    }

    logger.info('Voucher válido:', voucher);
    return {
      success: true,
      data: voucher
    };

  } catch (error) {
    logger.error('Erro ao validar voucher descartável:', error);
    return {
      success: false,
      error: 'Erro ao validar voucher'
    };
  }
};

export const useDisposableVoucher = async (
  code: string,
  mealTypeId: string
): Promise<DisposableVoucherValidationResult> => {
  try {
    // 1. Validar o voucher primeiro
    const validationResult = await validateDisposableVoucher(code, mealTypeId);
    if (!validationResult.success) {
      return validationResult;
    }

    const voucher = validationResult.data;

    // 2. Marcar voucher como usado em uma transação
    const { error: updateError } = await supabase
      .from('vouchers_descartaveis')
      .update({
        usado_em: new Date().toISOString(),
        data_uso: new Date().toISOString()
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

    // 3. Registrar o uso do voucher
    const { error: usageError } = await supabase
      .from('uso_voucher')
      .insert({
        voucher_descartavel_id: voucher.id,
        tipo_refeicao_id: mealTypeId,
        tipo_voucher: 'descartavel',
        usado_em: new Date().toISOString()
      });

    if (usageError) {
      logger.error('Erro ao registrar uso do voucher:', usageError);
      return {
        success: false,
        error: 'Erro ao registrar uso do voucher'
      };
    }

    toast.success('Voucher validado com sucesso!');
    return {
      success: true,
      data: voucher
    };

  } catch (error) {
    logger.error('Erro ao usar voucher descartável:', error);
    return {
      success: false,
      error: 'Erro ao processar voucher'
    };
  }
};