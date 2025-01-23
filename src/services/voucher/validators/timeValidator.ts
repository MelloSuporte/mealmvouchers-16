import { supabase } from '@/config/supabase';
import logger from '@/config/logger';
import { toast } from "sonner";

interface TimeValidationResult {
  success: boolean;
  error?: string;
}

export const validateTimeInterval = async (userId: string): Promise<TimeValidationResult> => {
  try {
    // Buscar uso do voucher hoje
    const today = new Date().toISOString().split('T')[0];
    const { data: usageToday, error } = await supabase
      .from('uso_voucher')
      .select('usado_em')
      .eq('usuario_id', userId)
      .gte('usado_em', today)
      .order('usado_em', { ascending: false })
      .limit(1);

    if (error) {
      logger.error('Erro ao verificar uso do voucher:', error);
      return { 
        success: false, 
        error: 'Erro ao verificar intervalo entre refeições' 
      };
    }

    // Se houver uso hoje, verificar intervalo
    if (usageToday && usageToday.length > 0) {
      const lastUsage = new Date(usageToday[0].usado_em);
      const now = new Date();
      const diffInMinutes = (now.getTime() - lastUsage.getTime()) / (1000 * 60);

      // Intervalo mínimo de 60 minutos
      if (diffInMinutes < 60) {
        const remainingMinutes = Math.ceil(60 - diffInMinutes);
        return {
          success: false,
          error: `Aguarde ${remainingMinutes} minutos para usar outro voucher`
        };
      }
    }

    return { success: true };
  } catch (error) {
    logger.error('Erro na validação de intervalo:', error);
    return { 
      success: false, 
      error: 'Erro ao validar intervalo entre refeições' 
    };
  }
};

export const validateMealTime = async (mealTypeId: string): Promise<TimeValidationResult> => {
  try {
    // Buscar tipo de refeição
    const { data: mealType, error } = await supabase
      .from('tipos_refeicao')
      .select('horario_inicio, horario_fim, minutos_tolerancia')
      .eq('id', mealTypeId)
      .single();

    if (error || !mealType) {
      logger.error('Erro ao buscar tipo de refeição:', error);
      return { 
        success: false, 
        error: 'Tipo de refeição não encontrado' 
      };
    }

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const [startHour, startMinute] = mealType.horario_inicio.split(':');
    const [endHour, endMinute] = mealType.horario_fim.split(':');
    
    const startDate = new Date();
    startDate.setHours(parseInt(startHour), parseInt(startMinute), 0);
    
    const endDate = new Date();
    endDate.setHours(parseInt(endHour), parseInt(endMinute), 0);
    endDate.setMinutes(endDate.getMinutes() + (mealType.minutos_tolerancia || 0));

    if (now < startDate || now > endDate) {
      return {
        success: false,
        error: `Esta refeição só pode ser utilizada entre ${mealType.horario_inicio} e ${mealType.horario_fim} (tolerância de ${mealType.minutos_tolerancia} minutos)`
      };
    }

    return { success: true };
  } catch (error) {
    logger.error('Erro na validação de horário:', error);
    return { 
      success: false, 
      error: 'Erro ao validar horário da refeição' 
    };
  }
};