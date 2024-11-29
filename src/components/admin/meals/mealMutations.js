import { supabase } from '../../../config/supabase';

export const deleteMeals = async (ids) => {
  const { error } = await supabase
    .from('tipos_refeicao')
    .delete()
    .in('id', ids);
  
  if (error) throw error;
  return true;
};

export const toggleMealActive = async ({ id, currentStatus }) => {
  const { error } = await supabase
    .from('tipos_refeicao')
    .update({ ativo: !currentStatus })
    .eq('id', id);
  
  if (error) throw error;
  return true;
};