import { createClient } from '@supabase/supabase-js';
import pg from 'pg';
import logger from './logger';

const isDevelopment = process.env.NODE_ENV === 'development';

// Configuração Supabase (Desenvolvimento)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

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

if (isDevelopment) {
  // Usar Supabase em desenvolvimento
  dbClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  });
  
  logger.info('Conectado ao Supabase em modo desenvolvimento');
} else {
  // Usar PostgreSQL em produção
  const pool = new pg.Pool(pgConfig);
  dbClient = pool;
  
  logger.info('Conectado ao PostgreSQL em modo produção');
}

// Verificar conexão
if (isDevelopment) {
  dbClient.from('empresas')
    .select('count', { count: 'exact', head: true })
    .then(({ error }) => {
      if (error) {
        logger.error('Erro ao conectar com banco:', error);
        throw error;
      } else {
        logger.info('Conexão com banco testada com sucesso');
      }
    });
} else {
  dbClient.query('SELECT NOW()')
    .then(() => {
      logger.info('Conexão com banco testada com sucesso');
    })
    .catch((error) => {
      logger.error('Erro ao conectar com banco:', error);
      throw error;
    });
}

export default dbClient;