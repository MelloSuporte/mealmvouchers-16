import { supabase } from '../../config/supabase';
import logger from '../../config/logger';

export const findUserByCPF = async (cpf) => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select(`
        *,
        empresas (
          id,
          nome
        ),
        turnos (
          id,
          tipo_turno,
          horario_inicio,
          horario_fim
        )
      `)
      .eq('cpf', cpf)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      logger.error('Erro ao buscar usuário:', error);
      throw error;
    }

    return data;
  } catch (error) {
    logger.error('Erro ao buscar usuário por CPF:', error);
    throw error;
  }
};

export const saveUserToDatabase = async (userData) => {
  try {
    // Garantir que empresa_id seja um número
    const cleanUserData = {
      nome: userData.nome,
      cpf: userData.cpf,
      empresa_id: parseInt(userData.empresa_id, 10),
      turno_id: parseInt(userData.turno_id, 10),
      voucher: userData.voucher,
      suspenso: userData.suspenso,
      foto: userData.foto
    };

    logger.info('Dados limpos para salvar:', cleanUserData);

    // Verifica se o usuário já existe pelo CPF
    const { data: existingUser } = await supabase
      .from('usuarios')
      .select('id, empresa_id')
      .eq('cpf', cleanUserData.cpf)
      .single();

    let result;

    if (existingUser) {
      // Atualiza usuário existente
      logger.info('Atualizando usuário existente:', existingUser.id);
      const { data, error } = await supabase
        .from('usuarios')
        .update(cleanUserData)
        .eq('id', existingUser.id)
        .select(`
          *,
          empresas (
            id,
            nome
          ),
          turnos (
            id,
            tipo_turno,
            horario_inicio,
            horario_fim
          )
        `)
        .single();

      if (error) throw error;
      result = { data, error: null };
    } else {
      // Cria novo usuário
      logger.info('Criando novo usuário');
      const { data, error } = await supabase
        .from('usuarios')
        .insert([cleanUserData])
        .select(`
          *,
          empresas (
            id,
            nome
          ),
          turnos (
            id,
            tipo_turno,
            horario_inicio,
            horario_fim
          )
        `)
        .single();

      if (error) throw error;
      result = { data, error: null };
    }

    logger.info('Operação concluída com sucesso:', result.data);
    return result;
  } catch (error) {
    logger.error('Erro ao salvar usuário:', error);
    return { data: null, error };
  }
};