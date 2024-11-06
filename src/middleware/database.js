import pool from '../config/database.js';
import logger from '../config/logger.js';

export const withDatabase = async (req, res, next) => {
  let retries = 5;
  let delay = 1000; // Start with 1 second
  
  while (retries > 0) {
    try {
      const connection = await pool.getConnection();
      req.db = connection;
      
      // Ensure connection is released after request
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
      
      // Add timeout for request
      req.setTimeout(60000);
      
      return next();
    } catch (err) {
      retries--;
      logger.error(`Database connection error (${retries} retries left):`, err);
      
      if (retries === 0) {
        return res.status(503).json({ 
          error: 'Service temporarily unavailable',
          message: 'Could not connect to database. Please try again in a few moments.'
        });
      }
      
      // Wait exponentially longer between retries (1s, 2s, 4s, 8s, 16s)
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
};