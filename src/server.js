import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { securityMiddleware, corsOptions } from './middleware/security';
import voucherRoutes from './routes/vouchers';
import logger from './config/logger';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(securityMiddleware);

// Routes
app.use('/api/vouchers', voucherRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Start server
app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});