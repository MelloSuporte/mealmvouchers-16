import pool from '../config/database.js';
import logger from '../config/logger.js';

export const withDatabase = async (req, res, next) => {
  let retries = 3;
  let delay = 1000; // 1 segundo inicial
  
  const tryConnection = async () => {
    try {
      const connection = await pool.getConnection();
      req.db = connection;
      
      // Ensure connection is released after request
      res.on('finish', () => {
        if (req.db) {
          req.db.release();
        }
      });
      
      next();
    } catch (err) {
      if (retries > 0) {
        retries--;
        logger.warn(`Attempting to reconnect... (${retries} attempts remaining)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
        return tryConnection();
      }
      
      logger.error('Database connection error:', err);
      res.status(503).json({ 
        error: 'Service temporarily unavailable. Please try again in a few moments.'
      });
    }
  };

  await tryConnection();
};