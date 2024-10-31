import pool from '../config/database.js';
import logger from '../config/logger.js';

export const withDatabase = async (req, res, next) => {
  let retries = 3;
  let delay = 1000; // 1 segundo inicial
  
  const tryConnection = async () => {
    try {
      const connection = await pool.getConnection();
      req.db = connection;
      
      // Garantir que a conexão seja liberada após a requisição
      res.on('finish', () => {
        if (req.db) {
          req.db.release();
        }
      });
      
      next();
    } catch (err) {
      if (retries > 0) {
        retries--;
        logger.warn(`Tentando reconectar... (${retries} tentativas restantes)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
        return tryConnection();
      }
      
      logger.error('Erro de conexão com o banco de dados:', err);
      res.status(503).json({ 
        error: 'Serviço temporariamente indisponível. Por favor, tente novamente em alguns instantes.'
      });
    }
  };

  await tryConnection();
};