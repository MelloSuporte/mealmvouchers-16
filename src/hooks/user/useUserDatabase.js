import { supabase } from '../../config/supabase';
import logger from '../../config/logger';

export const saveUserToDatabase = async (userData, isUpdate = false) => {
  // Remover campos undefined ou null
  const cleanUserData = Object.fromEntries(
    Object.entries(userData).filter(([_, v]) => v != null)
  );

  // Converter IDs para números
  if (cleanUserData.empresa_id) {
    cleanUserData.empresa_id = Number(cleanUserData.empresa_id);
  }
  if (cleanUserData.turno_id) {
    cleanUserData.turno_id = Number(cleanUserData.turno_id);
  }

  try {
    const query = supabase.from('usuarios');
    
    if (isUpdate && userData.id) {
      const { data, error } = await query
        .update(cleanUserData)
        .eq('id', userData.id)
        .select();

      if (error) throw error;
      return { data: data[0], error: null };
    }
    
    const { data, error } = await query
      .insert([cleanUserData])
      .select();

    if (error) throw error;
    return { data: data[0], error: null };
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