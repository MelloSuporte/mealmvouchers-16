import { supabase } from '../../../config/supabase';
import { toast } from "sonner";

export const deleteMeals = async (ids) => {
  try {
    // Primeiro, verificar se há registros vinculados
    const { data: usageRecords, error: checkError } = await supabase
      .from('uso_voucher')
      .select('tipo_refeicao_id')
      .in('tipo_refeicao_id', ids);

    if (checkError) throw checkError;

    // Se houver registros vinculados, apenas desativar
    if (usageRecords && usageRecords.length > 0) {
      const { error: updateError } = await supabase
        .from('tipos_refeicao')
        .update({ ativo: false })
        .in('id', ids);

      if (updateError) throw updateError;
      
      toast.info("Algumas refeições possuem registros de uso e foram apenas desativadas");
      return true;
    }

    // Se não houver registros vinculados, excluir normalmente
    const { error: deleteError } = await supabase
      .from('tipos_refeicao')
      .delete()
      .in('id', ids);
    
    if (deleteError) throw deleteError;
    return true;
  } catch (error) {
    console.error('Erro ao excluir/desativar refeições:', error);
    throw error;
  }
};

export const toggleMealActive = async ({ id, currentStatus }) => {
  const { error } = await supabase
    .from('tipos_refeicao')
    .update({ ativo: !currentStatus })
    .eq('id', id);
  
  if (error) throw error;
  return true;
};