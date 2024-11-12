import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  throw new Error('Supabase environment variables are not properly configured');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`
    }
  }
});

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  },
  db: {
    schema: 'public'
  }
});

// Verificar conexão com tratamento de erro adequado
const checkConnection = async () => {
  try {
    const { data, error } = await supabaseAdmin
      .from('empresas')
      .select('count', { count: 'exact', head: true });

    if (error) {
      console.error('Erro na conexão com Supabase:', error);
      throw error;
    }

    console.log('Conexão com Supabase estabelecida com sucesso');
  } catch (error) {
    console.error('Falha ao conectar com Supabase:', error);
  }
};

checkConnection();

export default supabase;