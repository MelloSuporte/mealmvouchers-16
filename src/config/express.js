import express from 'express';
import cors from 'cors';
import { securityMiddleware } from '../middleware/security.js';
import routes from '../routes/index.js';
import logger from './logger.js';

export const configureExpress = (app) => {
  // Middleware de logging
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
  });

  // Configuração do CORS
  const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:5173', 'http://127.0.0.1:5173'];

  const corsOptions = {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  };
  
  app.use(cors(corsOptions));
  
  // Configuração dos limites de payload
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  
  // Middleware de segurança
  app.use(securityMiddleware);
  
  // Rota de verificação de saúde
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'OK', 
      message: 'Servidor funcionando normalmente',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  });

  // Log todas as rotas disponíveis
  logger.info('Rotas disponíveis:');
  app._router && app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      logger.info(`${Object.keys(middleware.route.methods)} ${middleware.route.path}`);
    }
  });

  // Montagem das rotas da API
  app.use('/api', routes);
  logger.info('Rotas da API montadas em /api');

  // Middleware de erro 404
  app.use((req, res) => {
    logger.warn(`Rota não encontrada: ${req.method} ${req.url}`);
    res.status(404).json({ 
      success: false, 
      error: 'Rota não encontrada' 
    });
  });

  // Middleware de tratamento de erros
  app.use((err, req, res, next) => {
    logger.error('Erro na aplicação:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  });
};