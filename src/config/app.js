import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { securityMiddleware } from '../middleware/security.js';
import { withDatabase } from '../middleware/database.js';
import apiRoutes from '../routes/api.js';
import logger from './logger.js';

dotenv.config();

const createApp = () => {
  const app = express();

  // Configurar middleware
  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  app.use(securityMiddleware);

  // Rotas da API com middleware de banco de dados
  app.use('/api', withDatabase, apiRoutes);

  // Health check endpoint (sem middleware de banco)
  app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
  });

  // Tratamento de erros
  app.use((err, req, res, next) => {
    logger.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
};

export default createApp;