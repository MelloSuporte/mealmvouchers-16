import express from 'express';
import dotenv from 'dotenv';
import { configureExpress } from './config/express.js';
import { configureRoutes } from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import logger from './config/logger.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Configure Express middleware
configureExpress(app);

// Configure routes
configureRoutes(app);

// Error handling
app.use(errorHandler);

// Start server
app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});