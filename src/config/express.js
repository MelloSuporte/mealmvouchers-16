import express from 'express';
import cors from 'cors';
import { securityMiddleware } from '../middleware/security.js';
import routes from '../routes/index.js';

export const configureExpress = (app) => {
  app.use(cors({
    origin: true,
    credentials: true
  }));
  
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  
  app.use(securityMiddleware);
  
  // Rota de verificação de saúde
  app.get('/health', (req, res) => {
    res.json({ status: 'OK' });
  });
  
  // Todas as rotas são montadas com o prefixo /api
  app.use('/api', routes);
};