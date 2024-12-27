import { supabase } from '../../config/supabase';
import logger from '../../config/logger';
import { logSystemEvent, LOG_TYPES } from '../../utils/systemLogs';

export const validateVoucherTime = async (tipoRefeicaoId, turnoId) => {
  try {
    const { data, error } = await supabase.rpc('check_meal_time_and_shift', {
      p_tipo_refeicao_id: tipoRefeicaoId,
      p_turno_id: turnoId
    });

    if (error) throw error;
    return data;
  } catch (error) {
    logger.error('Erro ao validar horário:', error);
    throw new Error('Erro ao validar horário do voucher');
  }
};

export const validateVoucherUsage = async (userId, tipoRefeicaoId) => {
  try {
    // Verificar uso no dia
    const today = new Date().toISOString().split('T')[0];
    const { data: usosHoje, error: errorUsos } = await supabase
      .from('uso_voucher')
      .select('*')
      .eq('usuario_id', userId)
      .gte('usado_em', today);

    if (errorUsos) throw errorUsos;

    // Máximo 2 vouchers por turno
    if (usosHoje?.length >= 2) {
      throw new Error('Limite de vouchers por turno atingido');
    }

    // Verificar mesmo tipo de refeição
    const mesmoTipo = usosHoje?.find(uso => uso.tipo_refeicao_id === tipoRefeicaoId);
    if (mesmoTipo) {
      throw new Error('Você já utilizou um voucher para este tipo de refeição hoje');
    }

    // Verificar intervalo mínimo de 2 horas
    if (usosHoje?.length > 0) {
      const ultimoUso = new Date(usosHoje[usosHoje.length - 1].usado_em);
      const agora = new Date();
      const diffHoras = (agora - ultimoUso) / (1000 * 60 * 60);
      
      if (diffHoras < 2) {
        throw new Error('É necessário aguardar 2 horas entre refeições');
      }
    }

    return true;
  } catch (error) {
    logger.error('Erro na validação de uso:', error);
    throw error;
  }
};

export const registerVoucherUsage = async (userId, tipoRefeicaoId, tipoVoucher, voucherId) => {
  try {
    logger.info('Registrando uso do voucher:', {
      userId,
      tipoRefeicaoId,
      tipoVoucher,
      voucherId
    });

    // Primeiro buscar dados do usuário para registro completo
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    // Preparar dados para inserção
    const usageData = {
      usuario_id: userId,
      tipo_refeicao_id: tipoRefeicaoId,
      usado_em: new Date().toISOString(),
      cpf: userData.cpf,
      observacao: `Voucher ${tipoVoucher} utilizado`
    };

    // Inserir registro de uso
    const { data, error } = await supabase
      .from('uso_voucher')
      .insert([usageData])
      .select()
      .single();

    if (error) {
      logger.error('Erro ao inserir uso do voucher:', error);
      throw error;
    }

    await logSystemEvent({
      tipo: LOG_TYPES.USO_VOUCHER,
      mensagem: 'Voucher utilizado com sucesso',
      detalhes: { userId, tipoRefeicaoId, tipoVoucher, voucherId }
    });

    return { success: true, data };
  } catch (error) {
    logger.error('Erro ao registrar uso do voucher:', error);
    await logSystemEvent({
      tipo: LOG_TYPES.ERRO_USO_VOUCHER,
      mensagem: 'Erro ao registrar uso do voucher',
      detalhes: error,
      nivel: 'error'
    });
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

    // Buscar dados do voucher
    let voucher = null;
    let userId = null;
    let turnoId = null;

    switch (tipoVoucher) {
      case 'comum':
        const resultComum = await validateCommonVoucher(voucherCode);
        if (!resultComum.success) {
          return resultComum;
        }
        voucher = resultComum.user;
        userId = voucher?.id;
        turnoId = voucher?.turno_id;
        break;
        
      case 'extra':
        const resultExtra = await validateExtraVoucher(voucherCode);
        if (!resultExtra.success) {
          return resultExtra;
        }
        voucher = resultExtra.voucher;
        userId = voucher?.usuario_id;
        turnoId = voucher?.turno_id;
        break;
        
      case 'descartavel':
        const resultDescartavel = await validateDisposableVoucher(voucherCode);
        if (!resultDescartavel.success) {
          return resultDescartavel;
        }
        voucher = resultDescartavel.voucher;
        break;
    }

    if (!voucher) {
      throw new Error('Voucher não encontrado ou já utilizado');
    }

    // Validar horário se não for descartável
    if (tipoVoucher !== 'descartavel') {
      const timeValid = await validateVoucherTime(tipoRefeicaoId, turnoId);
      if (!timeValid) {
        throw new Error('Horário não permitido para esta refeição');
      }

      // Validar regras de uso
      await validateVoucherUsage(userId, tipoRefeicaoId);
    }

    // Registrar o uso do voucher
    const usageResult = await registerVoucherUsage(userId, tipoRefeicaoId, tipoVoucher, voucherCode);
    
    if (!usageResult.success) {
      throw new Error('Erro ao registrar uso do voucher');
    }

    return { 
      success: true, 
      voucher,
      tipoVoucher,
      userId
    };
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

const validateCommonVoucher = async (codigo) => {
  try {
    logger.info('Validando voucher comum:', codigo);
    
    const { data: user, error } = await supabase
      .from('usuarios')
      .select(`
        *,
        empresas (
          nome,
          ativo
        ),
        turnos (
          tipo_turno,
          horario_inicio,
          horario_fim
        )
      `)
      .eq('voucher', String(codigo))
      .eq('suspenso', false)
      .single();

    if (error || !user) {
      logger.info('Voucher comum inválido');
      return { success: false, error: 'Voucher comum inválido' };
    }

    // Verificar se o usuário está suspenso
    if (user.suspenso) {
      return { success: false, error: 'Usuário suspenso' };
    }

    // Verificar se a empresa está ativa
    if (!user.empresas?.ativo) {
      return { success: false, error: 'Empresa inativa' };
    }

    logger.info('Voucher comum válido:', user);
    return { success: true, user };
  } catch (error) {
    logger.error('Erro ao validar voucher comum:', error);
    throw error;
  }
};

const validateExtraVoucher = async (codigo) => {
  try {
    const { data: voucher, error } = await supabase
      .from('vouchers_extras')
      .select('*')
      .eq('codigo', String(codigo))
      .is('usado_em', null)
      .single();

    if (error || !voucher) {
      return { success: false, error: 'Voucher extra inválido ou já utilizado' };
    }

    return { success: true, voucher };
  } catch (error) {
    logger.error('Erro ao validar voucher extra:', error);
    throw error;
  }
};

const validateDisposableVoucher = async (codigo) => {
  try {
    const { data: voucher, error } = await supabase
      .from('vouchers_descartaveis')
      .select('*')
      .eq('codigo', String(codigo))
      .is('usado_em', null)
      .single();

    if (error || !voucher) {
      return { success: false, error: 'Voucher descartável inválido ou já utilizado' };
    }

    return { success: true, voucher };
  } catch (error) {
    logger.error('Erro ao validar voucher descartável:', error);
    throw error;
  }
};
