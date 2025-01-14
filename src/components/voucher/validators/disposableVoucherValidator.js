import { supabase } from '../../../config/supabase';
import logger from '../../../config/logger';

export const findDisposableVoucher = async (code) => {
  try {
    logger.info('Buscando voucher descartável:', code);
    
    const { data, error } = await supabase
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
      .eq('codigo', code)
      .is('usado_em', null)
      .is('usado', false)
      .maybeSingle();

    if (error) {
      logger.error('Erro ao buscar voucher descartável:', error);
      throw error;
    }

    if (!data) {
      logger.info('Voucher descartável não encontrado ou já utilizado:', code);
      return { data: null };
    }

    logger.info('Voucher descartável encontrado:', data);
    return { data };
  } catch (error) {
    logger.error('Erro ao buscar voucher descartável:', error);
    throw error;
  }
};

export const validateAndUseDisposableVoucher = async (voucherDescartavel, tipoRefeicaoId) => {
  try {
    if (!voucherDescartavel || !tipoRefeicaoId) {
      throw new Error('Voucher e tipo de refeição são obrigatórios');
    }

    // Verificar se o voucher já foi usado
    if (voucherDescartavel.usado_em) {
      logger.warn('Tentativa de usar voucher já utilizado:', voucherDescartavel.codigo);
      return {
        success: false,
        error: 'Este voucher já foi utilizado'
      };
    }

    // Verificar data de expiração
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expirationDate = new Date(voucherDescartavel.data_expiracao);
    expirationDate.setHours(0, 0, 0, 0);

    if (expirationDate < today) {
      logger.warn('Tentativa de usar voucher expirado:', voucherDescartavel.codigo);
      return {
        success: false,
        error: 'Este voucher está expirado'
      };
    }

    if (expirationDate > today) {
      const formattedDate = expirationDate.toLocaleDateString('pt-BR');
      logger.warn('Tentativa de usar voucher antes da data:', voucherDescartavel.codigo);
      return {
        success: false,
        error: `Este voucher é válido apenas para ${formattedDate}`
      };
    }

    // Verificar tipo de refeição
    const { data: tipoRefeicao, error: tipoRefeicaoError } = await supabase
      .from('tipos_refeicao')
      .select('*')
      .eq('id', tipoRefeicaoId)
      .single();

    if (tipoRefeicaoError || !tipoRefeicao) {
      logger.error('Erro ao buscar tipo de refeição:', tipoRefeicaoError);
      return {
        success: false,
        error: 'Tipo de refeição não encontrado'
      };
    }

    // Verificar horário
    const currentTime = new Date().toTimeString().slice(0, 5);
    const [startHour, startMinute] = tipoRefeicao.horario_inicio.split(':');
    const [endHour, endMinute] = tipoRefeicao.horario_fim.split(':');
    
    const now = new Date();
    const startTime = new Date(now.setHours(parseInt(startHour), parseInt(startMinute), 0));
    const endTime = new Date(now.setHours(parseInt(endHour), parseInt(endMinute) + (tipoRefeicao.minutos_tolerancia || 15), 0));
    
    const currentDateTime = new Date();
    currentDateTime.setHours(parseInt(currentTime.split(':')[0]), parseInt(currentTime.split(':')[1]), 0);

    if (currentDateTime < startTime || currentDateTime > endTime) {
      logger.warn('Tentativa de uso fora do horário permitido:', currentTime);
      return {
        success: false,
        error: `${tipoRefeicao.nome} só pode ser utilizado entre ${tipoRefeicao.horario_inicio} e ${tipoRefeicao.horario_fim} (tolerância de ${tipoRefeicao.minutos_tolerancia || 15} minutos)`
      };
    }

    // Registrar uso do voucher em uma única transação
    const { data: usageResult, error: usageError } = await supabase.rpc('register_disposable_voucher_usage', {
      p_voucher_id: voucherDescartavel.id,
      p_tipo_refeicao_id: tipoRefeicaoId
    });

    if (usageError) {
      logger.error('Erro ao registrar uso do voucher:', usageError);
      return {
        success: false,
        error: 'Erro ao registrar uso do voucher'
      };
    }

    logger.info('Voucher utilizado com sucesso:', voucherDescartavel.codigo);
    return {
      success: true,
      message: 'Voucher utilizado com sucesso'
    };

  } catch (error) {
    logger.error('Erro ao validar voucher descartável:', error);
    return {
      success: false,
      error: error.message || 'Erro ao validar voucher'
    };
  }
};