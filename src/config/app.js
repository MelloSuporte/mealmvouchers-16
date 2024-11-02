import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { securityMiddleware } from '../middleware/security.js';
import routes from './routes.js';
import logger from './logger.js';
import { withDatabase } from '../middleware/database.js';

dotenv.config();

const createApp = () => {
  const app = express();

  // Configure middleware
  app.use(cors({
    origin: process.env.ALLOWED_ORIGINS || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  app.use(securityMiddleware);

  // Health check endpoint (without database middleware)
  app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
  });

  // Apply database middleware to all routes except health check
  app.use('/api', withDatabase);
  
  // Mount all routes under /api
  app.use('/api', routes);

  // Error handling
  app.use((err, req, res, next) => {
    logger.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
};

export default createApp;