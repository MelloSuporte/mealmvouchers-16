import createApp from './config/app.js';
import { startServer } from './config/server.js';
import { testConnection } from './config/database.js';
import logger from './config/logger.js';

const initializeServer = async () => {
  try {
    // Test database connection before starting
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Unable to connect to database');
    }
    
    const app = createApp();
    startServer(app);
  } catch (error) {
    logger.error('Failed to initialize server:', error);
    process.exit(1);
  }
};

initializeServer();