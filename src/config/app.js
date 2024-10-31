import express from 'express';
import dotenv from 'dotenv';
import { configureExpress } from './express.js';
import { configureRoutes } from '../routes/index.js';
import { errorHandler } from '../middleware/errorHandler.js';
import logger from './logger.js';

dotenv.config();

const createApp = () => {
  const app = express();

  // Configure Express middleware
  configureExpress(app);

  // Configure routes
  configureRoutes(app);

  // Error handling
  app.use(errorHandler);

  return app;
};

export default createApp;