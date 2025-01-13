import React from 'react';
import { toast } from "sonner";
import logger from '../../config/logger';
import { supabase } from '../../config/supabase';
import { identifyVoucherType } from '../../services/voucherValidationService';

const syncReportData = async (usoVoucherId) => {
  try {
    logger.info('Iniciando sincronização com relatório:', { usoVoucherId });
    
    // Buscar dados do uso do voucher com todas as relações necessárias
    const { data: usoVoucher, error: usoError } = await supabase
      .from('uso_voucher')
      .select(`
        id,
        usado_em,
        usuario_id,
        tipo_refeicao_id,
        observacao,
        usuarios (
          id,
          nome,
          cpf,
          empresa_id,
          turno_id,
          setor_id
        ),
        tipos_refeicao (
          id,
          nome,
          valor
        )
      `)
      .eq('id', usoVoucherId)
      .single();

    if (usoError) {
      logger.error('Erro ao buscar dados do uso do voucher:', usoError);
      throw usoError;
    }

    if (!usoVoucher) {
      logger.error('Registro de uso do voucher não encontrado:', { usoVoucherId });
      return;
    }

    logger.info('Dados do uso do voucher recuperados:', usoVoucher);

    // Buscar dados complementares em paralelo
    const [empresaResult, setorResult, turnoResult] = await Promise.all([
      supabase
        .from('empresas')
        .select('nome')
        .eq('id', usoVoucher.usuarios?.empresa_id)
        .single(),
      supabase
        .from('setores')
        .select('nome_setor')
        .eq('id', usoVoucher.usuarios?.setor_id)
        .single(),
      supabase
        .from('turnos')
        .select('tipo_turno')
        .eq('id', usoVoucher.usuarios?.turno_id)
        .single()
    ]);

    // Verificar erros nas consultas paralelas
    if (empresaResult.error) logger.error('Erro ao buscar empresa:', empresaResult.error);
    if (setorResult.error) logger.error('Erro ao buscar setor:', setorResult.error);
    if (turnoResult.error) logger.error('Erro ao buscar turno:', turnoResult.error);

    // Preparar dados para inserção no relatório
    const reportData = {
      data_uso: usoVoucher.usado_em,
      usuario_id: usoVoucher.usuario_id,
      nome_usuario: usoVoucher.usuarios?.nome,
      cpf: usoVoucher.usuarios?.cpf,
      empresa_id: usoVoucher.usuarios?.empresa_id,
      nome_empresa: empresaResult.data?.nome,
      turno: turnoResult.data?.tipo_turno,
      setor_id: usoVoucher.usuarios?.setor_id,
      nome_setor: setorResult.data?.nome_setor,
      tipo_refeicao: usoVoucher.tipos_refeicao?.nome,
      valor: usoVoucher.tipos_refeicao?.valor,
      observacao: usoVoucher.observacao
    };

    logger.info('Dados preparados para sincronização:', reportData);

    // Inserir no relatório
    const { error: insertError } = await supabase
      .from('relatorio_uso_voucher')
      .upsert([reportData], {
        onConflict: 'data_uso,usuario_id,tipo_refeicao'
      });

    if (insertError) {
      logger.error('Erro ao sincronizar relatório:', insertError);
      throw insertError;
    }

    logger.info('Relatório sincronizado com sucesso:', reportData);
    toast.success('Dados sincronizados com sucesso para o relatório');
  } catch (error) {
    logger.error('Erro na sincronização do relatório:', error);
    toast.error('Erro ao sincronizar dados do relatório: ' + error.message);
    throw error;
  }
};

export const validateVoucher = async (voucherCode, mealType) => {
  try {
    logger.info('Iniciando validação do voucher:', { voucherCode, mealType });
    
    // Identificar tipo do voucher
    const voucherType = await identifyVoucherType(voucherCode);
    logger.info('Tipo de voucher identificado:', voucherType);

    if (!voucherType) {
      throw new Error('Voucher inválido');
    }

    // Validar voucher com base no tipo
    const { data, error } = await supabase
      .rpc('validate_and_use_voucher', {
        p_codigo: voucherCode,
        p_tipo_refeicao_id: mealType
      });

    if (error) {
      logger.error('Erro na validação do voucher:', error);
      // Verificar se é um erro de horário
      if (error.message.includes('fora do horário')) {
        throw new Error('Fora do horário permitido');
      }
      throw error;
    }

    logger.info('Resposta da validação:', data);

    if (!data?.success) {
      throw new Error(data?.error || 'Erro ao validar voucher');
    }

    // Se a validação foi bem sucedida e temos o ID do registro
    if (data.uso_voucher_id) {
      logger.info('Iniciando sincronização após validação bem-sucedida:', data.uso_voucher_id);
      await syncReportData(data.uso_voucher_id);
    }

    return {
      ...data,
      voucherType // Include the voucher type in the response
    };
  } catch (error) {
    logger.error('Erro na validação do voucher:', error);
    throw error;
  }
};