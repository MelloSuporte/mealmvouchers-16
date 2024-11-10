import { createClient } from '@supabase/supabase-js';
import logger from './logger';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceRole = import.meta.env.VITE_SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRole) {
  logger.error('Variáveis de ambiente do Supabase não configuradas');
  throw new Error('As variáveis de ambiente do Supabase são necessárias');
}

// Cliente público (anônimo)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Cliente com service role (para operações administrativas)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  }
});

// Verificar conexão
supabase.from('empresas')
  .select('count', { count: 'exact', head: true })
  .then(({ error }) => {
    if (error) {
      logger.error('Erro ao conectar com Supabase:', error);
      throw error;
    } else {
      logger.info('Conectado com sucesso ao Supabase');
    }
  });

export default supabase;