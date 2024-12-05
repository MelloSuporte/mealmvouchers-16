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

  // Configuração do CORS para permitir todas as origens em desenvolvimento
  const corsOptions = {
    origin: '*',
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

  // Montagem das rotas da API
  app.use('/api', routes);
  logger.info('Rotas da API montadas em /api');

  // Middleware de erro 404
  app.use((req, res) => {
    logger.warn(`Rota não encontrada: ${req.method} ${req.url}`);
    res.status(404).json({ 
      error: 'Rota não encontrada',
      path: req.url,
      method: req.method
    });
  });

  // Middleware de tratamento de erros
  app.use((err, req, res, next) => {
    logger.error('Erro na aplicação:', err);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Um erro inesperado ocorreu'
    });
  });
};