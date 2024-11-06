import pool from '../config/database.js';
import logger from '../config/logger.js';

export const withDatabase = async (req, res, next) => {
  let retries = 3;
  
  const tryConnection = async () => {
    try {
      const connection = await pool.getConnection();
      
      // Teste a conexão
      await connection.ping();
      
      req.db = connection;
      
      // Garante que a conexão seja liberada após a resposta
      res.on('finish', () => {
        if (req.db) {
          req.db.release();
        }
      });

      // Libera conexão em caso de erro
      res.on('error', () => {
        if (req.db) {
          req.db.release();
        }
      });

      next();
    } catch (error) {
      if (retries > 0) {
        retries--;
        logger.warn(`Tentativa de reconexão com banco de dados. Tentativas restantes: ${retries}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return tryConnection();
      }
      
      logger.error('Erro fatal de conexão com banco de dados:', error);
      res.status(503).json({
        error: 'Serviço temporariamente indisponível',
        message: 'Não foi possível conectar ao banco de dados. Tente novamente em alguns instantes.'
      });
    }
  };

  await tryConnection();
};