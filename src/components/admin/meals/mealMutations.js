import { supabase } from '../../../config/supabase';
import { toast } from "sonner";

export const toggleMealActive = async ({ id, currentStatus }) => {
  try {
    const { error } = await supabase
      .from('tipos_refeicao')
      .update({ ativo: currentStatus })
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erro ao alterar status:', error);
    throw error;
  }
};

export const deleteMeals = async (mealIds) => {
  try {
    const { error } = await supabase
      .from('tipos_refeicao')
      .delete()
      .in('id', mealIds);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erro ao excluir refeições:', error);
    throw error;
  }
};