import { supabase } from '@/config/supabase';
import logger from '@/config/logger';
import { toast } from "sonner";
import { VoucherValidationParams, ValidationResult, MealType } from '@/types/voucher';

export const validateVoucher = async (params: VoucherValidationParams): Promise<ValidationResult> => {
  try {
    logger.info('Iniciando validação do voucher:', params);

    // 1. Validar tipo de refeição
    const { data: mealType, error: mealTypeError } = await supabase
      .from('tipos_refeicao')
      .select('*')
      .eq('id', params.mealTypeId)
      .single();

    if (mealTypeError || !mealType) {
      logger.error('Tipo de refeição inválido:', mealTypeError);
      return { success: false, error: 'Tipo de refeição inválido' };
    }

    // 2. Validar horário da refeição
    const isValidTime = validateMealTime(mealType);
    if (!isValidTime) {
      return {
        success: false,
        error: `Esta refeição só pode ser utilizada entre ${mealType.horario_inicio} e ${mealType.horario_fim}`
      };
    }

    // 3. Verificar se é voucher descartável
    const { data: disposableVoucher } = await supabase
      .from('vouchers_descartaveis')
      .select('*')
      .eq('codigo', params.code)
      .maybeSingle();

    if (disposableVoucher) {
      return validateDisposableVoucher(disposableVoucher, mealType);
    }

    // 4. Se não for descartável, validar como voucher comum
    return validateCommonVoucher(params, mealType);

  } catch (error) {
    logger.error('Erro na validação:', error);
    return { 
      success: false, 
      error: 'Erro ao validar voucher' 
    };
  }
};

const validateMealTime = (mealType: MealType): boolean => {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const [startHour, startMinute] = mealType.horario_inicio.split(':');
  const [endHour, endMinute] = mealType.horario_fim.split(':');

  const startMinutes = parseInt(startHour) * 60 + parseInt(startMinute);
  const endMinutes = parseInt(endHour) * 60 + parseInt(endMinute) + 
    (mealType.minutos_tolerancia || 0);

  return currentTime >= startMinutes && currentTime <= endMinutes;
};

const validateDisposableVoucher = async (voucher: any, mealType: MealType): Promise<ValidationResult> => {
  // Validar se já foi usado
  if (voucher.usado_em) {
    return { success: false, error: 'Este voucher já foi utilizado' };
  }

  // Validar data de validade
  const today = new Date();
  const expirationDate = new Date(voucher.data_expiracao);
  
  if (today > expirationDate) {
    return { success: false, error: 'Voucher expirado' };
  }

  // Validar tipo de refeição
  if (voucher.tipo_refeicao_id !== mealType.id) {
    return { success: false, error: 'Tipo de refeição inválido para este voucher' };
  }

  return { success: true, data: voucher };
};

const validateCommonVoucher = async (
  params: VoucherValidationParams, 
  mealType: MealType
): Promise<ValidationResult> => {
  try {
    // Buscar usuário e validar voucher comum
    const { data: user, error: userError } = await supabase
      .from('usuarios')
      .select(`
        *,
        empresas (
          id,
          nome,
          ativo
        ),
        turnos (
          id,
          tipo_turno,
          horario_inicio,
          horario_fim,
          ativo
        )
      `)
      .eq('voucher', params.code)
      .single();

    if (userError || !user) {
      return { success: false, error: 'Voucher inválido' };
    }

    // Validar status do usuário
    if (user.suspenso) {
      return { success: false, error: 'Usuário suspenso' };
    }

    // Validar empresa ativa
    if (!user.empresas?.ativo) {
      return { success: false, error: 'Empresa inativa' };
    }

    // Validar turno
    if (!user.turnos?.ativo) {
      return { success: false, error: 'Turno inativo' };
    }

    // Validar horário do turno
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:00`;

    if (currentTime < user.turnos.horario_inicio || currentTime > user.turnos.horario_fim) {
      return { 
        success: false, 
        error: `Fora do horário do turno (${user.turnos.horario_inicio} - ${user.turnos.horario_fim})` 
      };
    }

    // Validar limite diário e intervalo
    const today = new Date().toISOString().split('T')[0];
    const { data: usageToday } = await supabase
      .from('uso_voucher')
      .select('*')
      .eq('usuario_id', user.id)
      .gte('usado_em', today);

    if (usageToday && usageToday.length >= 3) {
      return { success: false, error: 'Limite diário de refeições atingido' };
    }

    // Validar intervalo mínimo
    if (usageToday && usageToday.length > 0) {
      const lastUsage = new Date(usageToday[usageToday.length - 1].usado_em);
      const minInterval = new Date(lastUsage.getTime() + (3 * 60 * 60 * 1000)); // 3 horas

      if (now < minInterval) {
        return { success: false, error: 'Intervalo mínimo entre refeições não respeitado' };
      }
    }

    return { success: true, data: user };

  } catch (error) {
    logger.error('Erro ao validar voucher comum:', error);
    return { success: false, error: 'Erro ao validar voucher' };
  }
};