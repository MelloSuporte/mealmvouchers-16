import pool from '../config/database.js';
import logger from '../config/logger.js';

export const withDatabase = async (req, res, next) => {
  let retries = 3;
  
  const tryConnection = async () => {
    try {
      const connection = await pool.getConnection();
      req.db = connection;
      
      // Ensure connection is released after request is complete
      res.on('finish', () => {
        if (req.db) {
          req.db.release();
        }
      });
      
      // Also handle errors to ensure connection is released
      res.on('error', () => {
        if (req.db) {
          req.db.release();
        }
      });
      
      next();
    } catch (err) {
      if (retries > 0) {
        retries--;
        logger.warn(`Database connection failed, retrying... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return tryConnection();
      }
      
      logger.error('Database connection error:', err);
      res.status(500).json({ 
        error: 'Erro de conexão com o banco de dados',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  };

  await tryConnection();
};