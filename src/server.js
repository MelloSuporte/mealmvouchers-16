import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { securityMiddleware } from './middleware/security.js';
import { withDatabase } from './middleware/database.js';
import apiRoutes from './routes/api.js';
import logger from './config/logger.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(securityMiddleware);
app.use(withDatabase);

// Routes
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling
app.use((err, req, res, next) => {
  logger.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(port, '0.0.0.0', () => {
  logger.info(`Server running on port ${port}`);
});

export default app;