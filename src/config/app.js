import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { securityMiddleware } from '../middleware/security.js';
import routes from '../routes/index.js';
import logger from './logger.js';
import { errorHandler } from '../middleware/errorHandler.js';
import { withDatabase } from '../middleware/database.js';
import { supabase } from './supabase.js';

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

  // Add detailed request logging
  app.use((req, res, next) => {
    logger.info(`[${new Date().toISOString()}] ${req.method} ${req.path}`, {
      headers: req.headers,
      query: req.query,
      body: req.body
    });
    next();
  });

  // Health check endpoint with database verification
  app.get('/health', async (req, res) => {
    try {
      // Teste de conexão com Supabase
      const { data, error } = await supabase
        .from('empresas')
        .select('count', { count: 'exact', head: true });

      if (error) {
        logger.error('Erro na conexão com Supabase:', error);
        return res.status(500).json({ 
          status: 'ERROR', 
          message: 'Erro na conexão com banco de dados',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }

      res.json({ 
        status: 'OK', 
        message: 'Servidor e banco de dados funcionando',
        timestamp: new Date().toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
    } catch (error) {
      logger.error('Erro no health check:', error);
      res.status(500).json({ 
        status: 'ERROR',
        message: 'Erro ao verificar status do servidor'
      });
    }
  });

  // Mount all routes with database connection and /api prefix
  app.use(withDatabase);
  app.use('/api', routes);

  // Global error handler - must be last
  app.use(errorHandler);

  return app;
};

export default createApp;