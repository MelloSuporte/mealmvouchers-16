import pool from '../config/database.js';
import logger from '../config/logger.js';

export const withDatabase = async (req, res, next) => {
  try {
    const connection = await pool.getConnection();
    req.db = connection;
    
    // Ensure connection is released after request
    res.on('finish', () => {
      if (req.db) {
        req.db.release();
        logger.debug('Database connection released');
      }
    });
    
    next();
  } catch (err) {
    logger.error('Database connection error:', err);
    res.status(503).json({ 
      error: 'Database service unavailable',
      message: 'Unable to establish database connection. Please try again later.'
    });
  }
};