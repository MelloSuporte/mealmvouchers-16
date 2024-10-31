import pool from '../config/database.js';
import logger from '../config/logger.js';

export const withDatabase = async (req, res, next) => {
  let retries = 3;
  
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
      
      // Tratar erros para garantir que a conexão seja liberada
      res.on('error', () => {
        if (req.db) {
          req.db.release();
        }
      });
      
      next();
    } catch (err) {
      if (retries > 0) {
        retries--;
        logger.warn(`Falha na conexão com o banco, tentando novamente... (${retries} tentativas restantes)`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return tryConnection();
      }
      
      logger.error('Erro de conexão com o banco de dados:', err);
      res.status(503).json({ 
        error: 'Serviço temporariamente indisponível',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  };

  await tryConnection();
};