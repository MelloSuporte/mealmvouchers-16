import express from 'express';
import cors from 'cors';
import { securityMiddleware } from '../middleware/security.js';
import { withDatabase } from '../middleware/database.js';
import routes from './routes.js';

export const configureExpress = (app) => {
  // Enable CORS with specific options
  app.use(cors({
    origin: process.env.ALLOWED_ORIGINS || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400 // 24 hours
  }));
  
  // Parse JSON bodies with increased limit
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  
  // Apply security middleware
  app.use(securityMiddleware);
  
  // Apply database middleware to all routes except health check
  app.use('/api', withDatabase);
  
  // Mount all routes under /api
  app.use('/api', routes);
  
  // Basic health check route
  app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
  });
};