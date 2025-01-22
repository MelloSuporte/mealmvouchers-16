import { supabase } from '../../config/supabase';
import logger from '../../config/logger';

export const validateVoucher = async (codigo, tipoRefeicaoId) => {
  try {
    logger.info('Iniciando validação do voucher:', { codigo, tipoRefeicaoId });
    
    // First try to find as common voucher
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
      .eq('voucher', codigo)
      .maybeSingle();

    if (userError) {
      logger.error('Erro ao buscar usuário:', userError);
      throw userError;
    }

    // If found as common voucher
    if (user) {
      logger.info('Voucher comum encontrado:', user);

      if (user.suspenso) {
        return { success: false, error: 'Usuário suspenso' };
      }

      if (!user.empresas?.ativo) {
        return { success: false, error: 'Empresa inativa' };
      }

      if (!user.turnos?.ativo) {
        return { success: false, error: 'Turno inativo' };
      }

      // Validate shift time
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}:00`;

      const shiftStart = user.turnos.horario_inicio;
      const shiftEnd = user.turnos.horario_fim;

      // Handle shifts that cross midnight
      const isWithinShift = shiftEnd < shiftStart 
        ? (currentTime >= shiftStart || currentTime <= shiftEnd)
        : (currentTime >= shiftStart && currentTime <= shiftEnd);

      if (!isWithinShift) {
        return { 
          success: false, 
          error: `Fora do horário do turno (${shiftStart} - ${shiftEnd})` 
        };
      }

      // Check meal usage for today
      const today = new Date().toISOString().split('T')[0];
      const { data: usageToday, error: usageError } = await supabase
        .from('uso_voucher')
        .select('*')
        .eq('usuario_id', user.id)
        .gte('usado_em', today);

      if (usageError) {
        logger.error('Erro ao verificar uso do voucher:', usageError);
        throw usageError;
      }

      if (usageToday && usageToday.length >= 3) {
        return { success: false, error: 'Limite diário de refeições atingido' };
      }

      return {
        success: true,
        voucherType: 'comum',
        user: user
      };
    }

    // If not found as common voucher, try disposable
    const { data: disposableVoucher, error: disposableError } = await supabase
      .from('vouchers_descartaveis')
      .select(`
        *,
        tipos_refeicao (
          id,
          nome,
          horario_inicio,
          horario_fim,
          minutos_tolerancia,
          ativo
        )
      `)
      .eq('codigo', codigo)
      .is('usado_em', null)
      .maybeSingle();

    if (disposableError) {
      logger.error('Erro ao buscar voucher descartável:', disposableError);
      throw disposableError;
    }

    if (disposableVoucher) {
      logger.info('Voucher descartável encontrado:', disposableVoucher);
      return {
        success: true,
        voucherType: 'descartavel',
        data: disposableVoucher
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