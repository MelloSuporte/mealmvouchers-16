import { supabase } from '../../../config/supabase';

export const toggleMealActive = async ({ id, currentStatus }) => {
  const { error } = await supabase
    .from('tipos_refeicao')
    .update({ ativo: currentStatus })
    .eq('id', id);

  if (error) throw error;
  return { success: true };
};

export const deleteMeals = async (mealIds) => {
  const { error } = await supabase
    .from('tipos_refeicao')
    .delete()
    .in('id', mealIds);

  if (error) throw error;
  return { success: true };
};