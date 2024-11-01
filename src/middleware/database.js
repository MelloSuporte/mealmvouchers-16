import pool from '../config/database.js';
import logger from '../config/logger.js';

export const withDatabase = async (req, res, next) => {
  let retries = 3;
  let delay = 1000; // 1 second initial delay
  
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
        logger.warn(`Database connection attempt failed. Retrying in ${delay}ms... (${retries} attempts remaining)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
        return tryConnection();
      }
      
      logger.error('All database connection attempts failed:', err);
      res.status(503).json({ 
        error: 'Database service unavailable',
        message: 'Unable to establish database connection. Please try again later.'
      });
    }
  };

  await tryConnection();
};