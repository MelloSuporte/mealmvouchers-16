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
  app.use(cors({
    origin: process.env.FRONTEND_URL || true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  
  // Configuração dos limites de payload
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  
  // Middleware de segurança
  app.use(securityMiddleware);
  
  // Rota de verificação de saúde
  app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Servidor funcionando normalmente' });
  });

  // Montagem das rotas da API
  app.use('/', routes);
  logger.info('Rotas da API montadas');

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