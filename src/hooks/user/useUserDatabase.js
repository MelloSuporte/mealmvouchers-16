import { supabase } from '../../config/supabase';
import logger from '../../config/logger';

export const saveUserToDatabase = async (userData, isUpdate = false) => {
  const query = supabase.from('usuarios');
  
  if (isUpdate) {
    return await query
      .update(userData)
      .eq('id', userData.id)
      .select()
      .single();
  }
  
  return await query
    .insert([userData])
    .select()
    .single();
};

export const findUserByCPF = async (cpf) => {
  const { data, error } = await supabase
    .from('usuarios')
    .select('id')
    .eq('cpf', cpf)
    .maybeSingle();

  if (error) {
    logger.error('Erro ao buscar usuário:', error);
    throw error;
  }

  return data;
};