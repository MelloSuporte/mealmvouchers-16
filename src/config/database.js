import { createClient } from '@supabase/supabase-js';
import logger from './logger';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  logger.error('Variáveis de ambiente do Supabase não configuradas');
  throw new Error('As variáveis de ambiente do Supabase são necessárias');
}

const supabase = createClient(supabaseUrl, supabaseKey);

supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    logger.info('Usuário desconectado');
  } else if (event === 'SIGNED_IN') {
    logger.info('Usuário conectado');
  }
});

export default supabase;