import express from 'express';
import dotenv from 'dotenv';
import { configureExpress } from './config/express.js';
import logger from './config/logger.js';

dotenv.config();

const app = express();
configureExpress(app);

const port = process.env.PORT || 5000;
const server = app.listen(port, '0.0.0.0', () => {
  logger.info(`Server running on port ${port}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

export default app;