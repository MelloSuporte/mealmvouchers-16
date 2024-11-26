import { supabase } from '../../config/supabase';
import logger from '../../config/logger';

export const saveUserToDatabase = async (userData, isUpdate = false) => {
  // Remover campos undefined ou null
  const cleanUserData = Object.fromEntries(
    Object.entries(userData).filter(([_, v]) => v != null)
  );

  // Converter IDs para números
  if (cleanUserData.empresa_id) {
    cleanUserData.empresa_id = parseInt(cleanUserData.empresa_id);
  }
  if (cleanUserData.turno_id) {
    cleanUserData.turno_id = parseInt(cleanUserData.turno_id);
  }

  const query = supabase.from('usuarios');
  
  try {
    if (isUpdate && userData.id) {
      return await query
        .update(cleanUserData)
        .eq('id', userData.id)
        .select()
        .single();
    }
    
    return await query
      .insert([cleanUserData])
      .select()
      .single();
  } catch (error) {
    logger.error('Erro ao salvar usuário:', error);
    throw error;
  }
};

export const findUserByCPF = async (cpf) => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('cpf', cpf)
      .maybeSingle();

    if (error) {
      logger.error('Erro ao buscar usuário:', error);
      throw error;
    }

    return data;
  } catch (error) {
    logger.error('Erro ao buscar usuário por CPF:', error);
    throw error;
  }
};