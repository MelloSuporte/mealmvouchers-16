import { supabase } from '../../config/supabase';
import logger from '../../config/logger';
import { toast } from "sonner";

export const validateVoucher = async (codigo: string, tipoRefeicaoId: string) => {
  try {
    logger.info('Iniciando validação do voucher:', { codigo, tipoRefeicaoId });
    
    // 1. Validar tipo de refeição
    const { data: tipoRefeicao, error: tipoRefeicaoError } = await supabase
      .from('tipos_refeicao')
      .select('*')
      .eq('id', tipoRefeicaoId)
      .single();

    if (tipoRefeicaoError || !tipoRefeicao) {
      throw new Error('Tipo de refeição inválido');
    }

    // 2. Validar horário da refeição
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const startTime = tipoRefeicao.horario_inicio;
    const endTime = tipoRefeicao.horario_fim;
    const toleranceMinutes = tipoRefeicao.minutos_tolerancia || 0;

    const endTimeWithTolerance = new Date();
    const [endHour, endMinute] = endTime.split(':').map(Number);
    endTimeWithTolerance.setHours(endHour, endMinute + toleranceMinutes);

    const isWithinTime = currentTime >= startTime && 
                        currentTime <= `${endTimeWithTolerance.getHours().toString().padStart(2, '0')}:${endTimeWithTolerance.getMinutes().toString().padStart(2, '0')}`;

    if (!isWithinTime) {
      throw new Error(`Esta refeição só pode ser utilizada entre ${startTime} e ${endTime} (tolerância de ${toleranceMinutes} minutos)`);
    }

    // 3. Validar intervalo entre refeições
    const today = new Date().toISOString().split('T')[0];
    const { data: lastUsage } = await supabase
      .from('uso_voucher')
      .select('usado_em')
      .gte('usado_em', today)
      .order('usado_em', { ascending: false })
      .limit(1);

    if (lastUsage?.[0]) {
      const lastUsageTime = new Date(lastUsage[0].usado_em);
      const diffInMinutes = (now.getTime() - lastUsageTime.getTime()) / (1000 * 60);
      
      if (diffInMinutes < 60) { // 1 hora de intervalo
        throw new Error(`Aguarde ${Math.ceil(60 - diffInMinutes)} minutos para usar outro voucher`);
      }
    }

    // 4. Buscar e validar voucher
    const { data: user } = await supabase
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

    if (user) {
      // Validações para voucher comum
      if (user.suspenso) {
        throw new Error('Usuário suspenso');
      }

      if (!user.empresas?.ativo) {
        throw new Error('Empresa inativa');
      }

      if (!user.turnos?.ativo) {
        throw new Error('Turno inativo');
      }

      // Validar horário do turno
      const turnoStart = user.turnos.horario_inicio;
      const turnoEnd = user.turnos.horario_fim;
      
      const isWithinShift = turnoEnd < turnoStart 
        ? (currentTime >= turnoStart || currentTime <= turnoEnd)
        : (currentTime >= turnoStart && currentTime <= turnoEnd);

      if (!isWithinShift) {
        throw new Error(`Fora do horário do turno (${turnoStart} - ${turnoEnd})`);
      }

      return {
        success: true,
        voucherType: 'comum',
        user: user
      };
    }

    // 5. Tentar validar como voucher descartável
    const { data: disposableVoucher } = await supabase
      .from('vouchers_descartaveis')
      .select('*')
      .eq('codigo', codigo)
      .is('usado_em', null)
      .maybeSingle();

    if (disposableVoucher) {
      // Validar data de validade
      if (new Date(disposableVoucher.data_expiracao) < new Date()) {
        throw new Error('Voucher expirado');
      }

      return {
        success: true,
        voucherType: 'descartavel',
        data: disposableVoucher
      };
    }

    throw new Error('Voucher não encontrado ou inválido');

  } catch (error) {
    logger.error('Erro na validação:', error);
    toast.error(error.message || 'Erro ao validar voucher');
    return { 
      success: false, 
      error: error.message || 'Erro ao validar voucher'
    };
  }
};