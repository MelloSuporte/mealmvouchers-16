import { createClient } from '@supabase/supabase-js';
import logger from './logger.js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  logger.error('Supabase environment variables are not set');
  throw new Error('Supabase configuration is missing');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Verificar conexão
supabase.from('empresas').select('count', { count: 'exact' })
  .then(({ error }) => {
    if (error) {
      logger.error('Error connecting to Supabase:', error);
    } else {
      logger.info('Successfully connected to Supabase');
    }
  });