import { supabase } from '../../config/supabase';
import logger from '../../config/logger';
import { toast } from 'sonner';

export const validateVoucherExtra = async (codigo: string, tipoRefeicaoId: string) => {
  try {
    logger.info('Validando voucher extra:', { codigo, tipoRefeicaoId });

    // Buscar voucher extra
    const { data: voucher, error: voucherError } = await supabase
      .from('vouchers_extras')
      .select(`
        *,
        usuarios (
          id,
          nome,
          suspenso,
          empresa_id,
          turnos (
            id,
            tipo_turno,
            horario_inicio,
            horario_fim
          )
        ),
        tipos_refeicao (
          id,
          nome,
          horario_inicio,
          horario_fim,
          minutos_tolerancia
        )
      `)
      .eq('codigo', codigo)
      .is('usado_em', null)
      .single();

    if (voucherError) {
      logger.error('Erro ao buscar voucher extra:', voucherError);
      throw new Error('Voucher não encontrado ou já utilizado');
    }

    if (!voucher) {
      throw new Error('Voucher não encontrado ou já utilizado');
    }

    // Validar se voucher não está expirado
    if (new Date(voucher.valido_ate) < new Date()) {
      throw new Error('Voucher expirado');
    }

    // Validar se usuário não está suspenso
    if (voucher.usuarios?.suspenso) {
      throw new Error('Usuário suspenso');
    }

    // Validar empresa ativa
    const { data: empresa } = await supabase
      .from('empresas')
      .select('ativo')
      .eq('id', voucher.usuarios?.empresa_id)
      .single();

    if (!empresa?.ativo) {
      throw new Error('Empresa inativa');
    }

    // Validar horário da refeição
    const tipoRefeicao = voucher.tipos_refeicao;
    if (!tipoRefeicao) {
      throw new Error('Tipo de refeição não encontrado');
    }

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:00`;
    
    const [startHour, startMinute] = tipoRefeicao.horario_inicio.split(':');
    const [endHour, endMinute] = tipoRefeicao.horario_fim.split(':');
    
    const startTime = new Date();
    startTime.setHours(parseInt(startHour), parseInt(startMinute), 0);
    
    const endTime = new Date();
    endTime.setHours(parseInt(endHour), parseInt(endMinute), 0);
    endTime.setMinutes(endTime.getMinutes() + (tipoRefeicao.minutos_tolerancia || 0));

    if (now < startTime || now > endTime) {
      throw new Error('Fora do horário permitido para esta refeição');
    }

    // Validar intervalo entre refeições (60 minutos)
    const { data: ultimaRefeicao } = await supabase
      .from('uso_voucher')
      .select('usado_em')
      .eq('usuario_id', voucher.usuario_id)
      .order('usado_em', { ascending: false })
      .limit(1)
      .single();

    if (ultimaRefeicao?.usado_em) {
      const ultimoUso = new Date(ultimaRefeicao.usado_em);
      const intervaloMinutos = Math.floor((now.getTime() - ultimoUso.getTime()) / (1000 * 60));
      
      if (intervaloMinutos < 60) {
        throw new Error('Intervalo mínimo entre refeições não respeitado (60 minutos)');
      }
    }

    return {
      success: true,
      voucher,
      message: 'Voucher válido'
    };

  } catch (error) {
    logger.error('Erro na validação do voucher extra:', error);
    toast.error(error.message || 'Erro ao validar voucher');
    return {
      success: false,
      error: error.message || 'Erro ao validar voucher'
    };
  }
};