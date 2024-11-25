import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { securityMiddleware } from '../middleware/security.js';
import routes from '../routes/index.js';
import logger from './logger.js';
import { errorHandler } from '../middleware/errorHandler.js';
import { withDatabase } from '../middleware/database.js';

dotenv.config();

const createApp = () => {
  const app = express();

  // Enable trust proxy - required when running behind nginx
  app.enable('trust proxy');

  // Configure middleware
  app.use(cors({
    origin: process.env.ALLOWED_ORIGINS || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }));
  
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  app.use(securityMiddleware);

  // Add request logging
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`);
    next();
  });

  // Health check endpoint (without database middleware)
  app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Servidor está funcionando' });
  });

  // Mount all routes with database connection
  app.use(withDatabase);
  app.use('/', routes);

  // Global error handler - must be last
  app.use(errorHandler);

  // Prevent multiple response attempts
  app.use((err, req, res, next) => {
    if (res.headersSent) {
      return next(err);
    }
    next(err);
  });

  return app;
};

export default createApp;