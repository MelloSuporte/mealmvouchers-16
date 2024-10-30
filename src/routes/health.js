import express from 'express';
import { testConnection } from '../config/database.js';
import logger from '../config/logger.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const dbConnected = await testConnection();
    if (dbConnected) {
      res.json({ 
        status: 'OK', 
        message: 'Server is running',
        database: 'Connected'
      });
    } else {
      res.status(500).json({ 
        status: 'ERROR', 
        message: 'Database connection failed'
      });
    }
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(500).json({ 
      status: 'ERROR',
      message: error.message 
    });
  }
});

export default router;