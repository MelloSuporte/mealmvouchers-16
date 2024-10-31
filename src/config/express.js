import express from 'express';
import cors from 'cors';
import { securityMiddleware, corsOptions } from '../middleware/security.js';
import { withDatabase } from '../middleware/database.js';

export const configureExpress = (app) => {
  app.use(cors(corsOptions));
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  app.use(securityMiddleware);
  app.use(withDatabase);
};