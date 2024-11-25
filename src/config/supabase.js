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
  },
  // Configurações para melhorar a estabilidade
  persistSession: true,
  detectSessionInUrl: false,
  maxRetryCount: 3,
  retryInterval: 1000,
  // Configurações adicionais para evitar problemas de stream
  fetch: (url, options = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    }).then(async response => {
      // Cria uma cópia da resposta para evitar problemas de stream
      const data = await response.clone().json();
      return new Response(JSON.stringify(data), {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      });
    });
  }
});

// Verificar conexão com retry automático
const checkConnection = async (retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      logger.info('Conexão com Supabase verificada com sucesso');
      return true;
    } catch (error) {
      const attemptsLeft = retries - i - 1;
      logger.warn(`Tentativa ${i + 1} falhou. Tentativas restantes: ${attemptsLeft}`);
      
      if (attemptsLeft === 0) {
        logger.error('Erro ao conectar com Supabase após todas as tentativas:', error);
        throw error;
      }
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Inicializar conexão
checkConnection().catch(error => {
  logger.error('Falha ao inicializar conexão com Supabase:', error);
  process.exit(1);
});

export default supabase;