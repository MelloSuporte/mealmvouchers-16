import { supabase } from '../../../config/supabase';
import logger from '../../../config/logger';
import { toast } from "sonner";

interface ValidateCommonVoucherParams {
  userId: string;
  mealTypeId: string;
  shiftId: string;
}

export const validateCommonVoucherRules = async ({
  userId,
  mealTypeId,
  shiftId
}: ValidateCommonVoucherParams) => {
  try {
    // 1. Verificar limite diário (2 refeições)
    const today = new Date().toISOString().split('T')[0];
    const { data: dailyUsage, error: dailyError } = await supabase
      .from('uso_voucher')
      .select('*')
      .eq('usuario_id', userId)
      .gte('usado_em', today);

    if (dailyError) {
      logger.error('Erro ao verificar uso diário:', dailyError);
      throw new Error('Erro ao verificar limite diário');
    }

    if (dailyUsage && dailyUsage.length >= 2) {
      toast.error('Limite diário de refeições atingido (máximo 2)');
      return false;
    }

    // 2. Verificar intervalo mínimo (1 hora)
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const { data: recentUsage, error: recentError } = await supabase
      .from('uso_voucher')
      .select('usado_em')
      .eq('usuario_id', userId)
      .gte('usado_em', oneHourAgo.toISOString())
      .order('usado_em', { ascending: false })
      .limit(1);

    if (recentError) {
      logger.error('Erro ao verificar uso recente:', recentError);
      throw new Error('Erro ao verificar intervalo entre refeições');
    }

    if (recentUsage && recentUsage.length > 0) {
      toast.error('Deve aguardar 1 hora entre refeições');
      return false;
    }

    // 3. Verificar horário da refeição
    const { data: mealType, error: mealError } = await supabase
      .from('tipos_refeicao')
      .select('horario_inicio, horario_fim, minutos_tolerancia')
      .eq('id', mealTypeId)
      .single();

    if (mealError || !mealType) {
      logger.error('Erro ao verificar tipo de refeição:', mealError);
      throw new Error('Erro ao verificar horário da refeição');
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMinute] = mealType.horario_inicio.split(':');
    const [endHour, endMinute] = mealType.horario_fim.split(':');
    
    const startMinutes = parseInt(startHour) * 60 + parseInt(startMinute);
    const endMinutes = parseInt(endHour) * 60 + parseInt(endMinute) + 
      (mealType.minutos_tolerancia || 0);

    if (currentTime < startMinutes || currentTime > endMinutes) {
      toast.error(`Esta refeição só pode ser utilizada entre ${mealType.horario_inicio} e ${mealType.horario_fim}`);
      return false;
    }

    // 4. Verificar horário do turno
    const { data: shift, error: shiftError } = await supabase
      .from('turnos')
      .select('horario_inicio, horario_fim')
      .eq('id', shiftId)
      .single();

    if (shiftError || !shift) {
      logger.error('Erro ao verificar turno:', shiftError);
      throw new Error('Erro ao verificar horário do turno');
    }

    const [shiftStartHour, shiftStartMinute] = shift.horario_inicio.split(':');
    const [shiftEndHour, shiftEndMinute] = shift.horario_fim.split(':');
    
    const shiftStartMinutes = parseInt(shiftStartHour) * 60 + parseInt(shiftStartMinute);
    const shiftEndMinutes = parseInt(shiftEndHour) * 60 + parseInt(shiftEndMinute);

    // Lida com turnos que cruzam a meia-noite
    const isWithinShift = shiftEndMinutes < shiftStartMinutes 
      ? (currentTime >= shiftStartMinutes || currentTime <= shiftEndMinutes)
      : (currentTime >= shiftStartMinutes && currentTime <= shiftEndMinutes);

    if (!isWithinShift) {
      toast.error(`Fora do horário do turno (${shift.horario_inicio} - ${shift.horario_fim})`);
      return false;
    }

    return true;
  } catch (error) {
    logger.error('Erro na validação do voucher comum:', error);
    toast.error('Erro ao validar voucher');
    return false;
  }
};