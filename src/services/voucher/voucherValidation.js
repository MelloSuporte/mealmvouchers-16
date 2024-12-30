import { supabase } from '../../config/supabase';
import logger from '../../config/logger';
import { logSystemEvent, LOG_TYPES } from '../../utils/systemLogs';
import { validateCommonVoucher } from './validators/commonVoucherValidator';
import { validateExtraVoucher } from './validators/extraVoucherValidator';
import { validateDisposableVoucher } from './validators/disposableVoucherValidator';
import { validateVoucherTime } from './validators/timeValidator';

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

    // Preparar dados para inserção no relatório
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

    // Inserir no relatório
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

    // Garantir que o código seja uma string
    const voucherCode = String(codigo);
    
    // Identificar o tipo de voucher
    const tipoVoucher = await identifyVoucherType(voucherCode);
    
    if (!tipoVoucher) {
      await logSystemEvent({
        tipo: LOG_TYPES.VALIDACAO_FALHA,
        mensagem: 'Voucher não encontrado',
        detalhes: { codigo: voucherCode }
      });
      return { success: false, error: 'Voucher inválido' };
    }

    // Validar baseado no tipo
    let result;
    switch (tipoVoucher) {
      case 'comum':
        result = await validateCommonVoucher(voucherCode, tipoRefeicaoId);
        break;
      case 'extra':
        result = await validateExtraVoucher(voucherCode, tipoRefeicaoId);
        break;
      case 'descartavel':
        result = await validateDisposableVoucher(voucherCode, tipoRefeicaoId);
        break;
      default:
        throw new Error('Tipo de voucher não suportado');
    }

    // Se a validação foi bem sucedida, sincronizar com o relatório
    if (result.success && result.usoVoucherId) {
      await syncReportData(result.usoVoucherId);
    }

    return result;
  } catch (error) {
    logger.error('Erro na validação:', error);
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

const identifyVoucherType = async (codigo) => {
  try {
    logger.info('Identificando tipo de voucher:', codigo);
    
    // Garantir que o código seja uma string
    const voucherCode = String(codigo);
    
    // Primeiro tenta encontrar como voucher comum
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('voucher')
      .eq('voucher', voucherCode)
      .single();

    if (usuario) {
      logger.info('Voucher identificado como comum');
      return 'comum';
    }

    // Tenta encontrar como voucher extra
    const { data: voucherExtra } = await supabase
      .from('vouchers_extras')
      .select('*')
      .eq('codigo', voucherCode)
      .single();

    if (voucherExtra) {
      logger.info('Voucher identificado como extra');
      return 'extra';
    }

    // Tenta encontrar como voucher descartável
    const { data: voucherDescartavel } = await supabase
      .from('vouchers_descartaveis')
      .select('*')
      .eq('codigo', voucherCode)
      .single();

    if (voucherDescartavel) {
      logger.info('Voucher identificado como descartável');
      return 'descartavel';
    }

    logger.info('Tipo de voucher não identificado');
    return null;
  } catch (error) {
    logger.error('Erro ao identificar tipo de voucher:', error);
    return null;
  }
};
