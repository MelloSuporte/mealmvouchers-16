import { createClient } from '@supabase/supabase-js';
import pg from 'pg';
import logger from './logger';

const isDevelopment = process.env.NODE_ENV === 'development';

// Configuração Supabase (Desenvolvimento)
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

// Configuração PostgreSQL (Produção)
const pgConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// Cliente do banco de dados
let dbClient;

const testConnection = async () => {
  try {
    if (isDevelopment) {
      const { data, error } = await dbClient
        .from('empresas')
        .select('count', { count: 'exact', head: true });

      if (error) throw error;
      
      logger.info('Conexão com Supabase testada com sucesso');
      return true;
    } else {
      await dbClient.query('SELECT NOW()');
      logger.info('Conexão com PostgreSQL testada com sucesso');
      return true;
    }
  } catch (error) {
    logger.error('Erro ao testar conexão com banco:', error);
    throw error;
  }
};

if (isDevelopment) {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Variáveis de ambiente do Supabase não configuradas');
  }
  
  // Usar Supabase em desenvolvimento
  dbClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  });
  
  logger.info('Cliente Supabase inicializado em modo desenvolvimento');
} else {
  // Usar PostgreSQL em produção
  const pool = new pg.Pool({
    ...pgConfig,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    max: 20
  });
  
  dbClient = pool;
  logger.info('Pool PostgreSQL inicializado em modo produção');
}

// Testar conexão inicial
testConnection()
  .then(() => {
    logger.info('Conexão inicial com banco estabelecida com sucesso');
  })
  .catch((error) => {
    logger.error('Falha na conexão inicial com banco:', error);
    process.exit(1);
  });

export default dbClient;
export { testConnection };