import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { configureExpress } from './config/express.js';
import { startServer } from './config/server.js';
import createApp from './config/app.js';
import logger from './config/logger.js';

dotenv.config();

const app = createApp();

// Enhanced error handling middleware
app.use((err, req, res, next) => {
  logger.error('Server error:', err);
  
  // Handle specific database errors
  if (err.code === 'ECONNREFUSED') {
    return res.status(503).json({
      error: 'Database connection failed',
      message: 'Unable to connect to database. Please try again later.'
    });
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      message: err.message
    });
  }

  // Default error response
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
  });
});

configureExpress(app);
startServer(app);

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});