import { supabase } from '../../config/supabase';
import logger from '../../config/logger';
import { toast } from "sonner";
import { addMinutes, isWithinInterval, parse } from 'date-fns';

export const validateVoucher = async (codigo: string, tipoRefeicaoId: string) => {
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

      // Buscar tipo de refeição
      const { data: tipoRefeicao, error: tipoRefeicaoError } = await supabase
        .from('tipos_refeicao')
        .select('*')
        .eq('id', tipoRefeicaoId)
        .single();

      if (tipoRefeicaoError || !tipoRefeicao) {
        logger.error('Erro ao buscar tipo de refeição:', tipoRefeicaoError);
        return { success: false, error: 'Tipo de refeição não encontrado' };
      }

      // Validar horário do turno
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:00`;
      
      const turnoStart = parse(user.turnos.horario_inicio, 'HH:mm:ss', new Date());
      const turnoEnd = parse(user.turnos.horario_fim, 'HH:mm:ss', new Date());
      const currentDateTime = parse(currentTime, 'HH:mm:ss', new Date());

      if (!isWithinInterval(currentDateTime, { start: turnoStart, end: turnoEnd })) {
        return { 
          success: false, 
          error: `Fora do horário do seu turno (${user.turnos.horario_inicio} - ${user.turnos.horario_fim})` 
        };
      }

      // Validar horário da refeição
      const refeicaoStart = parse(tipoRefeicao.horario_inicio, 'HH:mm:ss', new Date());
      const refeicaoEnd = parse(tipoRefeicao.horario_fim, 'HH:mm:ss', new Date());
      const refeicaoEndWithTolerance = addMinutes(refeicaoEnd, tipoRefeicao.minutos_tolerancia || 0);

      if (!isWithinInterval(currentDateTime, { start: refeicaoStart, end: refeicaoEndWithTolerance })) {
        return { 
          success: false, 
          error: `Esta refeição só pode ser utilizada entre ${tipoRefeicao.horario_inicio} e ${tipoRefeicao.horario_fim} (tolerância de ${tipoRefeicao.minutos_tolerancia} minutos)` 
        };
      }

      // Verificar limite diário (2 refeições)
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

      if (usageToday && usageToday.length >= 2) {
        return { success: false, error: 'Limite diário de refeições atingido (máximo 2)' };
      }

      // Verificar intervalo mínimo (1 hora)
      if (usageToday && usageToday.length > 0) {
        const lastUsage = new Date(usageToday[usageToday.length - 1].usado_em);
        const minInterval = new Date(lastUsage.getTime() + (60 * 60 * 1000)); // 1 hora em milissegundos

        if (now < minInterval) {
          const minutesRemaining = Math.ceil((minInterval.getTime() - now.getTime()) / (1000 * 60));
          return { 
            success: false, 
            error: `Intervalo mínimo entre refeições não respeitado. Aguarde ${minutesRemaining} minutos.` 
          };
        }
      }

      return {
        success: true,
        voucherType: 'comum',
        user: user
      };
    }

    // Se não encontrou como voucher comum, tenta como descartável
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
      
      // Validar horário da refeição para voucher descartável
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:00`;
      
      const refeicaoStart = parse(disposableVoucher.tipos_refeicao.horario_inicio, 'HH:mm:ss', new Date());
      const refeicaoEnd = parse(disposableVoucher.tipos_refeicao.horario_fim, 'HH:mm:ss', new Date());
      const refeicaoEndWithTolerance = addMinutes(refeicaoEnd, disposableVoucher.tipos_refeicao.minutos_tolerancia || 0);
      const currentDateTime = parse(currentTime, 'HH:mm:ss', new Date());

      if (!isWithinInterval(currentDateTime, { start: refeicaoStart, end: refeicaoEndWithTolerance })) {
        return { 
          success: false, 
          error: `Esta refeição só pode ser utilizada entre ${disposableVoucher.tipos_refeicao.horario_inicio} e ${disposableVoucher.tipos_refeicao.horario_fim} (tolerância de ${disposableVoucher.tipos_refeicao.minutos_tolerancia} minutos)` 
        };
      }

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
    toast.error(error.message || 'Erro ao validar voucher');
    return { 
      success: false, 
      error: error.message || 'Erro ao validar voucher'
    };
  }
};