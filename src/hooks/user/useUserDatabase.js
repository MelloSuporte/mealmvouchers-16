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
    // Limpa e converte os dados antes de salvar
    const cleanUserData = {
      ...userData,
      empresa_id: userData.empresa_id ? Number(userData.empresa_id) : null,
      turno_id: userData.turno_id ? Number(userData.turno_id) : null
    };

    // Verifica se o usuário já existe pelo CPF
    const { data: existingUser } = await supabase
      .from('usuarios')
      .select('id')
      .eq('cpf', cleanUserData.cpf)
      .single();

    if (existingUser) {
      // Se existe, faz update
      logger.info('Atualizando usuário existente:', existingUser.id);
      const { data, error } = await supabase
        .from('usuarios')
        .update({
          nome: cleanUserData.nome,
          empresa_id: cleanUserData.empresa_id,
          voucher: cleanUserData.voucher,
          turno_id: cleanUserData.turno_id,
          suspenso: cleanUserData.suspenso,
          foto: cleanUserData.foto
        })
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
        `);

      if (error) throw error;
      return { data: data[0], error: null };
    } else {
      // Se não existe, faz insert
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
        `);

      if (error) throw error;
      return { data: data[0], error: null };
    }
  } catch (error) {
    logger.error('Erro ao salvar usuário:', error);
    return { data: null, error };
  }
};