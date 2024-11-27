import express from 'express';
import dotenv from 'dotenv';
import createApp from './config/app.js';
import logger from './config/logger.js';

dotenv.config();

const app = createApp();

// Iniciar o servidor
const port = process.env.PORT || 5000;
const server = app.listen(port, '0.0.0.0', () => {
  logger.info(`Server running on port ${port}`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});