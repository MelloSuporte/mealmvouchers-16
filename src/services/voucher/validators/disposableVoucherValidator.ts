import { supabase } from '../../../config/supabase';
import logger from '../../../config/logger';

export const validateDisposableVoucher = async (codigo: string, tipoRefeicaoId: string) => {
  try {
    logger.info('Iniciando validação detalhada do voucher descartável:', { codigo, tipoRefeicaoId });

    // Buscar voucher com informações do tipo de refeição
    const { data: voucher, error } = await supabase
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
      .eq('tipo_refeicao_id', tipoRefeicaoId)
      .is('usado_em', null)
      .gte('data_expiracao', new Date().toISOString().split('T')[0])
      .maybeSingle();

    if (error) {
      logger.error('Erro ao buscar voucher descartável:', error);
      return { success: false, error: 'Erro ao validar voucher descartável' };
    }

    if (!voucher) {
      logger.info('Voucher não encontrado ou já utilizado:', { codigo });
      return { success: false, error: 'Voucher não encontrado ou já utilizado' };
    }

    // Verificar tipo de refeição
    if (!voucher.tipos_refeicao?.ativo) {
      logger.info('Tipo de refeição inativo:', { tipoRefeicaoId });
      return { success: false, error: 'Tipo de refeição inativo' };
    }

    // Verificar horário da refeição
    const currentTime = new Date().toLocaleTimeString('pt-BR', { hour12: false });
    const endTime = new Date();
    const [hours, minutes] = voucher.tipos_refeicao.horario_fim.split(':');
    endTime.setHours(parseInt(hours), parseInt(minutes) + (voucher.tipos_refeicao.minutos_tolerancia || 0));
    
    if (!(currentTime >= voucher.tipos_refeicao.horario_inicio && 
          currentTime <= endTime.toLocaleTimeString('pt-BR', { hour12: false }))) {
      logger.info('Fora do horário permitido:', {
        currentTime,
        inicio: voucher.tipos_refeicao.horario_inicio,
        fim: voucher.tipos_refeicao.horario_fim,
        tolerancia: voucher.tipos_refeicao.minutos_tolerancia
      });
      return { 
        success: false, 
        error: `Esta refeição só pode ser utilizada entre ${voucher.tipos_refeicao.horario_inicio} e ${voucher.tipos_refeicao.horario_fim}`
      };
    }

    // Marcar voucher como usado com timestamp atual
    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from('vouchers_descartaveis')
      .update({
        usado_em: now,
        data_uso: now,
        usado: true
      })
      .eq('id', voucher.id)
      .is('usado_em', null);

    if (updateError) {
      logger.error('Erro ao marcar voucher como usado:', updateError);
      return { success: false, error: 'Erro ao marcar voucher como usado' };
    }

    // Registrar uso do voucher na tabela uso_voucher
    const { error: usageError } = await supabase
      .from('uso_voucher')
      .insert({
        voucher_descartavel_id: voucher.id,
        tipo_refeicao_id: tipoRefeicaoId,
        usado_em: now,
        tipo_voucher: 'descartavel'
      });

    if (usageError) {
      logger.error('Erro ao registrar uso do voucher:', usageError);
      return { success: false, error: 'Erro ao registrar uso do voucher' };
    }

    logger.info('Voucher validado com sucesso:', { 
      codigo,
      usado_em: now,
      data_uso: now
    });
    
    return { 
      success: true, 
      message: 'Voucher validado com sucesso',
      voucher
    };
  } catch (error) {
    logger.error('Erro ao validar voucher descartável:', error);
    return { success: false, error: 'Erro ao validar voucher descartável' };
  }
};