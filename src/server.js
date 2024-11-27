import express from 'express';
import dotenv from 'dotenv';
import { configureExpress } from './config/express.js';
import { startServer } from './config/server.js';
import createApp from './config/app.js';
import logger from './config/logger.js';

dotenv.config();

const app = createApp();

// Iniciar o servidor
startServer(app);

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});