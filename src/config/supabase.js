import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('As variáveis de ambiente do Supabase são necessárias');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Função auxiliar para consultas
export const executeQuery = async (table, query = {}) => {
  try {
    const { data, error } = await supabase
      .from(table)
      .select(query.select || '*')
      .eq(query.eq?.column || '', query.eq?.value || '')
      .order(query.orderBy || 'id', { ascending: query.ascending !== false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
};