import pool from '../config/database.js';
import logger from '../config/logger.js';

export const withDatabase = async (req, res, next) => {
  try {
    const connection = await pool.getConnection();
    req.db = connection;
    
    // Ensure connection is released after request is complete
    res.on('finish', () => {
      if (req.db) {
        req.db.release();
      }
    });
    
    next();
  } catch (err) {
    logger.error('Database connection error:', err);
    res.status(500).json({ 
      error: 'Erro de conexão com o banco de dados',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};