import pool from '../config/database.js';
import logger from '../config/logger.js';

export const withDatabase = async (req, res, next) => {
  let retries = 5;
  let delay = 1000; // Começa com 1 segundo
  
  while (retries > 0) {
    try {
      const connection = await pool.getConnection();
      req.db = connection;
      
      // Garante que a conexão seja liberada após a requisição
      res.on('finish', () => {
        if (req.db) {
          req.db.release();
        }
      });

      res.on('error', () => {
        if (req.db) {
          req.db.release();
        }
      });
      
      // Adiciona timeout para a requisição
      req.setTimeout(60000);
      
      return next();
    } catch (err) {
      retries--;
      logger.error(`Erro de conexão com banco (${retries} tentativas restantes):`, err);
      
      if (retries === 0) {
        return res.status(503).json({ 
          error: 'Serviço temporariamente indisponível',
          message: 'Não foi possível conectar ao banco de dados. Por favor, tente novamente em alguns instantes.'
        });
      }
      
      // Espera um tempo exponencial entre tentativas (1s, 2s, 4s, 8s, 16s)
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
};