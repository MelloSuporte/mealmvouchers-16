import pool from '../config/database.js';
import logger from '../config/logger.js';

export const withDatabase = async (req, res, next) => {
  let retries = 3;
  
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
      
      // Adiciona timeout para a requisição
      req.setTimeout(60000); // 60 segundos
      
      return next();
    } catch (err) {
      retries--;
      logger.error(`Database connection error (${retries} retries left):`, err);
      
      if (retries === 0) {
        return res.status(503).json({ 
          error: 'Serviço temporariamente indisponível',
          message: 'Não foi possível conectar ao banco de dados. Por favor, tente novamente em alguns instantes.'
        });
      }
      
      // Aguarda 2 segundos antes de tentar novamente
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
};