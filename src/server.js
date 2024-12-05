import express from 'express';
import dotenv from 'dotenv';
import { configureExpress } from './config/express.js';
import logger from './config/logger.js';

dotenv.config();

const app = express();
configureExpress(app);

const port = process.env.PORT || 5000;

// Add a pre-flight check to ensure the server is ready
const startServer = () => {
  try {
    const server = app.listen(port, '0.0.0.0', () => {
      logger.info(`Server running on port ${port}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
      logger.info(`API URL: ${process.env.VITE_API_URL}`);
      logger.info('Server is ready to accept connections');
    });

    // Add error handler for server startup
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${port} is already in use`);
        process.exit(1);
      }
      logger.error('Failed to start server:', error);
      process.exit(1);
    });

    // Graceful shutdown handling
    process.on('SIGTERM', () => {
      logger.info('SIGTERM signal received. Shutting down gracefully...');
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });

    return server;
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

const server = startServer();

export default app;