import { supabase } from '../../../config/supabase';
import logger from '../../../config/logger';
import { toast } from "sonner";

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

    // Registrar uso do voucher diretamente
    const timestamp = new Date().toISOString();
    
    const { error: updateError } = await supabase
      .from('vouchers_descartaveis')
      .update({ 
        usado_em: timestamp,
        data_uso: timestamp 
      })
      .eq('id', voucherDescartavel.id)
      .is('usado_em', null);

    if (updateError) {
      logger.error('Erro ao atualizar status do voucher:', updateError);
      return {
        success: false,
        error: 'Erro ao atualizar status do voucher'
      };
    }

    // Registrar o uso após atualizar o voucher
    const { error: usageError } = await supabase
      .from('uso_voucher')
      .insert({
        tipo_refeicao_id: tipoRefeicaoId,
        tipo_voucher: 'descartavel',
        usado_em: timestamp,
        voucher_descartavel_id: voucherDescartavel.id
      });

    if (usageError) {
      logger.error('Erro ao registrar uso do voucher:', usageError);
      
      // Reverter a atualização do voucher em caso de erro
      await supabase
        .from('vouchers_descartaveis')
        .update({ 
          usado_em: null,
          data_uso: null 
        })
        .eq('id', voucherDescartavel.id);

      return {
        success: false,
        error: 'Erro ao registrar uso do voucher'
      };
    }

    logger.info('Voucher utilizado com sucesso:', voucherDescartavel.codigo);
    toast.success('Voucher validado com sucesso');
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