import express from 'express';
import { testConnection } from '../config/database.js';
import logger from '../config/logger.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const dbConnected = await testConnection();
    res.json({ 
      status: dbConnected ? 'OK' : 'ERROR',
      message: dbConnected ? 'Server is running and database is connected' : 'Database connection failed',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({ 
      status: 'ERROR',
      message: error.message 
    });
  }
});

export default router;