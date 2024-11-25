import express from 'express';
import cors from 'cors';
import { securityMiddleware } from '../middleware/security.js';
import routes from '../routes/index.js';

export const configureExpress = (app) => {
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
  app.use('/api', routes);
};