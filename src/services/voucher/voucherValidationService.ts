import { supabase } from '@/config/supabase';
import logger from '@/config/logger';
import { toast } from "sonner";

interface ValidationResult {
  success: boolean;
  error?: string;
  data?: any;
}

export const validateVoucher = async (codigo: string, tipoRefeicaoId: string): Promise<ValidationResult> => {
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

    // 3. Verificar se é voucher descartável
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

    // 4. Se não for descartável, validar como voucher comum
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

    if (!user) {
      throw new Error('Voucher não encontrado ou inválido');
    }

    // 5. Validações do usuário
    if (user.suspenso) {
      throw new Error('Usuário suspenso');
    }

    if (!user.empresas?.ativo) {
      throw new Error('Empresa inativa');
    }

    if (!user.turnos?.ativo) {
      throw new Error('Turno inativo');
    }

    // 6. Validar horário do turno
    const turnoStart = user.turnos.horario_inicio;
    const turnoEnd = user.turnos.horario_fim;
    
    const isWithinShift = turnoEnd < turnoStart 
      ? (currentTime >= turnoStart || currentTime <= turnoEnd)
      : (currentTime >= turnoStart && currentTime <= turnoEnd);

    if (!isWithinShift) {
      throw new Error(`Fora do horário do turno (${turnoStart} - ${turnoEnd})`);
    }

    // 7. Validar intervalo entre refeições
    const today = new Date().toISOString().split('T')[0];
    const { data: usageToday } = await supabase
      .from('uso_voucher')
      .select('*')
      .eq('usuario_id', user.id)
      .gte('usado_em', today);

    if (usageToday && usageToday.length > 0) {
      const lastUsage = new Date(usageToday[usageToday.length - 1].usado_em);
      const minInterval = new Date(lastUsage.getTime() + (60 * 60 * 1000)); // 1 hora

      if (now < minInterval) {
        throw new Error('Deve aguardar 1 hora entre refeições');
      }
    }

    return {
      success: true,
      voucherType: 'comum',
      user: user
    };

  } catch (error) {
    logger.error('Erro na validação:', error);
    return { 
      success: false, 
      error: error.message || 'Erro ao validar voucher'
    };
  }
};