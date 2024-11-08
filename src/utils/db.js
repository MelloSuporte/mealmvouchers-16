import { supabase } from '../config/supabase';
import { toast } from "sonner";

export const executeQuery = async (table, options = {}) => {
  try {
    let query = supabase.from(table).select(options.select || '*');

    if (options.eq) {
      query = query.eq(options.eq.column, options.eq.value);
    }

    if (options.orderBy) {
      query = query.order(options.orderBy, { ascending: options.ascending !== false });
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  } catch (error) {
    toast.error('Erro no banco de dados: ' + error.message);
    throw error;
  }
};

export const insertRow = async (table, data) => {
  try {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select();

    if (error) throw error;
    return result;
  } catch (error) {
    toast.error('Erro ao inserir dados: ' + error.message);
    throw error;
  }
};

export const updateRow = async (table, id, data) => {
  try {
    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select();

    if (error) throw error;
    return result;
  } catch (error) {
    toast.error('Erro ao atualizar dados: ' + error.message);
    throw error;
  }
};

export const deleteRow = async (table, id) => {
  try {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    toast.error('Erro ao deletar dados: ' + error.message);
    throw error;
  }
};