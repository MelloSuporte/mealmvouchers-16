import express from 'express';
import cors from 'cors';
import { securityMiddleware } from '../middleware/security.js';
import routes from './routes.js';

export const configureExpress = (app) => {
  app.use(cors({
    origin: true,
    credentials: true
  }));
  
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  
  app.use(securityMiddleware);
  
  // Health check route
  app.get('/health', (req, res) => {
    res.json({ status: 'OK' });
  });
  
  // Mount all routes without /api prefix
  app.use('/', routes);
};