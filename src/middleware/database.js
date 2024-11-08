import { createClient } from '@supabase/supabase-js';
import logger from '../config/logger.js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

export const withDatabase = async (req, res, next) => {
  try {
    const { data: healthCheck, error: healthError } = await supabase.from('empresas').select('count').single();
    
    if (healthError) {
      logger.error('Erro na conexão com Supabase:', healthError);
      return res.status(503).json({
        error: 'Serviço temporariamente indisponível',
        message: 'Não foi possível conectar ao banco de dados. Tente novamente em alguns instantes.'
      });
    }

    req.supabase = supabase;
    next();
  } catch (error) {
    logger.error('Erro fatal de conexão com Supabase:', error);
    res.status(503).json({
      error: 'Serviço temporariamente indisponível',
      message: 'Erro ao conectar com o banco de dados. Tente novamente em alguns instantes.'
    });
  }
};