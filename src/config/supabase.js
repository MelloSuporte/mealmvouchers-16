import { createClient } from '@supabase/supabase-js';
import logger from './logger.js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  logger.error('Variáveis de ambiente do Supabase não estão configuradas');
  throw new Error('Variáveis de ambiente do Supabase não estão configuradas');
}

logger.info('Configurando cliente Supabase:', {
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
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`
    }
  },
  db: {
    schema: 'public'
  }
});

// Verificar conexão e políticas RLS
const checkConnection = async () => {
  try {
    logger.info('Verificando conexão com Supabase...');
    
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      logger.error('Erro ao verificar sessão:', sessionError);
      throw sessionError;
    }
    
    logger.info('Sessão atual:', {
      hasSession: !!session?.session,
      user: session?.session?.user?.email
    });

    // Testar acesso à tabela admin_users
    const { data: adminTest, error: adminError } = await supabase
      .from('admin_users')
      .select('count')
      .limit(1)
      .single();

    if (adminError) {
      logger.error('Erro ao acessar admin_users:', adminError);
    } else {
      logger.info('Acesso à tabela admin_users OK');
    }

    logger.info('Conexão Supabase verificada com sucesso');
    return true;
  } catch (error) {
    logger.error('Erro ao verificar conexão:', error);
    console.error('Detalhes completos do erro:', error);
    throw error;
  }
};

// Inicializar conexão
checkConnection().catch(error => {
  logger.error('Falha ao inicializar conexão:', error);
  console.error('Erro completo:', error);
});

export default supabase;