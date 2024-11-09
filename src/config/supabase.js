import { createClient } from '@supabase/supabase-js';
import logger from './logger';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseKey) {
  logger.error('Variáveis de ambiente do Supabase não configuradas');
  throw new Error('As variáveis de ambiente do Supabase são necessárias');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
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

export { supabase };