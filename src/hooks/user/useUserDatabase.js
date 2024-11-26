import { supabase } from '../../config/supabase';
import logger from '../../config/logger';

export const saveUserToDatabase = async (userData) => {
  try {
    // Verifica se o usuário já existe pelo CPF
    const { data: existingUser } = await supabase
      .from('usuarios')
      .select('id')
      .eq('cpf', userData.cpf)
      .single();

    if (existingUser) {
      // Se existe, faz update
      logger.info('Atualizando usuário existente:', existingUser.id);
      const { data, error } = await supabase
        .from('usuarios')
        .update({
          nome: userData.nome,
          empresa_id: userData.empresa_id,
          voucher: userData.voucher,
          turno_id: userData.turno_id,
          suspenso: userData.suspenso,
          foto: userData.foto
        })
        .eq('id', existingUser.id)
        .select();

      if (error) throw error;
      return { data: data[0], error: null };
    } else {
      // Se não existe, faz insert
      logger.info('Criando novo usuário');
      const { data, error } = await supabase
        .from('usuarios')
        .insert([userData])
        .select();

      if (error) throw error;
      return { data: data[0], error: null };
    }
  } catch (error) {
    logger.error('Erro ao salvar usuário:', error);
    return { data: null, error };
  }
};

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