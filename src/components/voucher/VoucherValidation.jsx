import { supabase } from '../../config/supabase';
import logger from '../../config/logger';
import { logSystemEvent, LOG_TYPES } from '../../utils/systemLogs';

const syncReportData = async (usoVoucherId) => {
  try {
    const { data: usoVoucher, error: usoError } = await supabase
      .from('uso_voucher')
      .select(`
        *,
        usuarios (
          id,
          nome,
          cpf,
          empresa_id,
          turno,
          setor_id
        ),
        tipos_refeicao (
          nome,
          valor
        )
      `)
      .eq('id', usoVoucherId)
      .single();

    if (usoError) throw usoError;

    if (!usoVoucher) {
      logger.error('Registro de uso do voucher não encontrado para sincronização');
      return;
    }

    // Buscar dados complementares
    const { data: empresa } = await supabase
      .from('empresas')
      .select('nome')
      .eq('id', usoVoucher.usuarios?.empresa_id)
      .single();

    const { data: setor } = await supabase
      .from('setores')
      .select('nome')
      .eq('id', usoVoucher.usuarios?.setor_id)
      .single();

    const reportData = {
      data_uso: usoVoucher.usado_em,
      usuario_id: usoVoucher.usuario_id,
      nome_usuario: usoVoucher.usuarios?.nome,
      cpf: usoVoucher.usuarios?.cpf,
      empresa_id: usoVoucher.usuarios?.empresa_id,
      nome_empresa: empresa?.nome,
      turno: usoVoucher.usuarios?.turno,
      setor_id: usoVoucher.usuarios?.setor_id,
      nome_setor: setor?.nome,
      tipo_refeicao: usoVoucher.tipos_refeicao?.nome,
      valor: usoVoucher.tipos_refeicao?.valor,
      observacao: usoVoucher.observacao
    };

    const { error: insertError } = await supabase
      .from('relatorio_uso_voucher')
      .upsert([reportData]);

    if (insertError) {
      logger.error('Erro ao sincronizar relatório:', insertError);
      throw insertError;
    }

    logger.info('Relatório sincronizado com sucesso:', reportData);
  } catch (error) {
    logger.error('Erro na sincronização do relatório:', error);
    throw error;
  }
};

export const validateVoucher = async (codigo, tipoRefeicaoId) => {
  try {
    await logSystemEvent({
      tipo: LOG_TYPES.TENTATIVA_VALIDACAO,
      mensagem: `Iniciando validação do voucher: ${codigo}`,
      detalhes: { codigo, tipoRefeicaoId }
    });

    logger.info('Iniciando validação do voucher:', { 
      voucherCode: codigo, 
      mealType: tipoRefeicaoId 
    });

    // Garantir que o código seja uma string
    const voucherCode = String(codigo);
    
    // Identificar o tipo de voucher
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('voucher')
      .eq('voucher', voucherCode)
      .single();

    if (usuario) {
      logger.info('Voucher identificado como comum');
      const { data, error } = await supabase
        .rpc('validate_and_use_voucher', {
          p_codigo: voucherCode,
          p_tipo_refeicao_id: tipoRefeicaoId
        });

      if (error) {
        logger.error('Erro na validação:', error);
        throw error;
      }

      logger.info('Resposta da validação:', data);
      return data;
    }

    // Tentar validar como voucher descartável
    const { data: voucherDescartavel } = await supabase
      .from('vouchers_descartaveis')
      .select('*')
      .eq('codigo', voucherCode)
      .single();

    if (voucherDescartavel) {
      logger.info('Voucher identificado como descartável');
      const { data, error } = await supabase
        .rpc('validate_and_use_voucher', {
          p_codigo: voucherCode,
          p_tipo_refeicao_id: tipoRefeicaoId
        });

      if (error) {
        logger.error('Erro na validação do voucher descartável:', error);
        throw error;
      }

      return data;
    }

    logger.info('Tipo de voucher não identificado');
    return { success: false, error: 'Voucher inválido' };

  } catch (error) {
    logger.error('Erro na validação do voucher:', error);
    await logSystemEvent({
      tipo: LOG_TYPES.ERRO_VALIDACAO_VOUCHER,
      mensagem: 'Erro na validação',
      detalhes: error,
      nivel: 'error'
    });
    return { 
      success: false, 
      error: error.message || 'Erro ao validar voucher'
    };
  }
};