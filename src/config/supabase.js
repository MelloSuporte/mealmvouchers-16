import { createClient } from '@supabase/supabase-js';
import logger from './logger.js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  logger.error('Variáveis de ambiente do Supabase não estão configuradas');
  throw new Error('Variáveis de ambiente do Supabase não estão configuradas');
}

console.log('Tentando conectar ao Supabase com:', {
  url: supabaseUrl,
  keyLength: supabaseAnonKey?.length || 0
});

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: { 
      'x-my-custom-header': 'voucher-app',
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`
    }
  }
});

// Verificar conexão
const checkConnection = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      logger.error('Erro ao verificar sessão Supabase:', error.message);
      throw error;
    }
    logger.info('Conexão com Supabase verificada com sucesso');
    console.log('Conexão Supabase bem-sucedida:', {
      url: supabaseUrl,
      authenticated: !!data.session,
      headers: supabase.rest.headers
    });
    return true;
  } catch (error) {
    logger.error('Erro ao conectar com Supabase:', error);
    console.error('Falha na conexão Supabase:', error);
    throw error;
  }
};

// Inicializar conexão
checkConnection().catch(error => {
  logger.error('Falha ao inicializar conexão com Supabase:', error);
  console.error('Erro de inicialização Supabase:', error);
});

export default supabase;