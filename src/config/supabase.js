import { createClient } from '@supabase/supabase-js';
import logger from './logger.js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variáveis de ambiente do Supabase não estão configuradas corretamente');
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
    logger.info('Conexão com Supabase verificada com sucesso');
  } catch (error) {
    logger.error('Erro ao conectar com Supabase:', error.message);
    throw error;
  }
};

checkConnection();

export default supabase;