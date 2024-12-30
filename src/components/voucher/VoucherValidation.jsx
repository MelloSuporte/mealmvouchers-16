import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import VoucherForm from './VoucherForm';
import { format } from 'date-fns-tz';
import logger from '../../config/logger';
import { supabase } from '../../config/supabase';
import { identifyVoucherType } from '../../services/voucherValidationService';

const syncReportData = async (usoVoucherId) => {
  try {
    logger.info('Iniciando sincronização com relatório:', { usoVoucherId });
    
    // Buscar dados do uso do voucher
    const { data: usoVoucher, error: usoError } = await supabase
      .from('uso_voucher')
      .select(`
        *,
        usuarios (
          id,
          nome,
          cpf,
          empresa_id,
          turno_id,
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
      logger.error('Registro de uso do voucher não encontrado');
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
      .select('nome_setor')
      .eq('id', usoVoucher.usuarios?.setor_id)
      .single();

    const { data: turno } = await supabase
      .from('turnos')
      .select('tipo_turno')
      .eq('id', usoVoucher.usuarios?.turno_id)
      .single();

    // Preparar dados para inserção no relatório
    const reportData = {
      data_uso: usoVoucher.usado_em,
      usuario_id: usoVoucher.usuario_id,
      nome_usuario: usoVoucher.usuarios?.nome,
      cpf: usoVoucher.usuarios?.cpf,
      empresa_id: usoVoucher.usuarios?.empresa_id,
      nome_empresa: empresa?.nome,
      turno: turno?.tipo_turno,
      setor_id: usoVoucher.usuarios?.setor_id,
      nome_setor: setor?.nome_setor,
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

export const validateVoucher = async (voucherCode, mealType) => {
  try {
    logger.info('Iniciando validação do voucher:', { voucherCode, mealType });
    
    // Get current time in America/Sao_Paulo timezone
    const currentTime = format(new Date(), 'HH:mm:ss', { timeZone: 'America/Sao_Paulo' });
    logger.info('Current time in São Paulo:', currentTime);

    // Validate and use voucher using RPC function
    const { data, error } = await supabase.rpc('validate_and_use_voucher', {
      p_codigo: voucherCode,
      p_tipo_refeicao_id: mealType
    });

    if (error) {
      logger.error('Erro ao validar voucher:', error);
      
      // Check if error message contains shift time error
      if (error.message?.includes('Fora do horário') || 
          error.message?.includes('horário não permitido')) {
        throw new Error('Fora do Horário de Turno');
      }
      
      throw error;
    }

    if (!data?.success) {
      throw new Error(data?.error || 'Erro ao validar voucher');
    }

    // Se a validação foi bem sucedida e temos o ID do registro
    if (data.uso_voucher_id) {
      await syncReportData(data.uso_voucher_id);
    }

    return data;
  } catch (error) {
    logger.error('Erro na validação:', error);
    throw error;
  }
};

const VoucherValidation = () => {
  const navigate = useNavigate();
  const [voucherCode, setVoucherCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isValidating) return;
    
    try {
      setIsValidating(true);
      logger.info('Iniciando validação do voucher:', voucherCode);
      
      // Identificar tipo de voucher
      const voucherType = await identifyVoucherType(voucherCode);
      logger.info('Tipo de voucher identificado:', voucherType);

      if (!voucherType) {
        toast.error('Voucher inválido');
        return;
      }

      // Validar baseado no tipo
      if (voucherType === 'descartavel') {
        const result = await validateVoucher(voucherCode);
        logger.info('Resultado validação voucher descartável:', result);
        
        if (result.success) {
          const { voucher } = result;
          localStorage.setItem('disposableVoucher', JSON.stringify({
            code: voucherCode,
            mealTypeId: voucher.tipo_refeicao_id,
            mealType: voucher.tipos_refeicao.nome
          }));
          navigate('/self-services');
          return;
        }
        toast.error(result.error);
      } else if (voucherType === 'comum') {
        const result = await validateVoucher(voucherCode);
        logger.info('Resultado validação voucher comum:', result);
        
        if (result.success) {
          const { user } = result;
          localStorage.setItem('commonVoucher', JSON.stringify({
            code: voucherCode,
            userName: user.nome,
            turno: user.turnos?.tipo_turno,
            cpf: user.cpf,
            userId: user.id
          }));
          navigate('/self-services');
          return;
        }

        // Check if the error is related to shift time
        if (result.error?.includes('Fora do horário do turno') || 
            result.error === 'Fora do Horário de Turno') {
          toast.error('Fora do Horário de Turno');
          return;
        }
        
        toast.error(result.error);
      } else {
        toast.error('Tipo de voucher não suportado no momento');
      }

    } catch (error) {
      logger.error('Erro ao validar voucher:', error);
      // Check if the error is related to shift time
      if (error.message?.includes('Fora do horário do turno') || 
          error.message === 'Fora do Horário de Turno') {
        toast.error('Fora do Horário de Turno');
        return;
      }
      toast.error(error.message || "Erro ao validar o voucher");
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <VoucherForm
      voucherCode={voucherCode}
      onSubmit={handleSubmit}
      onNumpadClick={(num) => setVoucherCode(prev => prev.length < 4 ? prev + num : prev)}
      onBackspace={() => setVoucherCode(prev => prev.slice(0, -1))}
      isValidating={isValidating}
    />
  );
};

export default VoucherValidation;