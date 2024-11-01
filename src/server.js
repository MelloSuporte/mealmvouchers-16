import createApp from './config/app.js';
import logger from './config/logger.js';

const app = createApp();
const port = process.env.PORT || 5000;

const startServer = () => {
  try {
    app.listen(port, '0.0.0.0', () => {
      logger.info(`Server running on port ${port}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();