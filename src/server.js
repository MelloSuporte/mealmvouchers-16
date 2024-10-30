import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { securityMiddleware, corsOptions } from './middleware/security.js';
import voucherRoutes from './routes/vouchers.js';
import reportRoutes from './routes/reports.js';
import healthRoutes from './routes/health.js';
import logger from './config/logger.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(securityMiddleware);

// Routes
app.use('/api/vouchers', voucherRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/health', healthRoutes);

// Error handling
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Start server
app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});