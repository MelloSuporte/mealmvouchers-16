import express from 'express';
import cors from 'cors';
import { securityMiddleware } from '../middleware/security.js';
import { withDatabase } from '../middleware/database.js';
import apiRoutes from '../routes/api.js';

export const configureExpress = (app) => {
  // Enable CORS for all routes
  app.use(cors());
  
  // Parse JSON bodies
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  
  // Security middleware
  app.use(securityMiddleware);
  
  // Mount API routes
  app.use('/api', apiRoutes);
  
  // Basic health check route
  app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
  });
};