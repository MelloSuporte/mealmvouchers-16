import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { securityMiddleware, corsOptions } from './middleware/security.js';
import voucherRoutes from './routes/vouchers.js';
import reportRoutes from './routes/reports.js';
import healthRoutes from './routes/health.js';
import mealsRoutes from './routes/meals.js';
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
app.use('/api/meals', mealsRoutes);

// Generic query endpoint (protected, admin only)
app.post('/api/query', securityMiddleware, async (req, res) => {
  const { query, params } = req.body;
  try {
    const db = await pool.getConnection();
    const [results] = await db.execute(query, params);
    res.json(results);
  } catch (error) {
    logger.error('Query error:', error);
    res.status(500).json({ error: error.message });
  }
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