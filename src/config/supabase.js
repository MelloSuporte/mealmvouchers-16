import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
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
      'x-my-custom-header': 'admin-master'
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Verificar conexão
const checkConnection = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    console.log('Conexão com Supabase verificada');
  } catch (error) {
    console.error('Erro ao conectar com Supabase:', error.message);
  }
};

checkConnection();

export default supabase;