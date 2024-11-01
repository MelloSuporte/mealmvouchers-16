import express from 'express';
import companiesRoutes from '../routes/companies.js';
import voucherRoutes from '../routes/vouchers.js';
import reportRoutes from '../routes/reports.js';
import healthRoutes from '../routes/health.js';
import mealsRoutes from '../routes/meals.js';
import usersRoutes from '../routes/users.js';
import extraVouchersRoutes from '../routes/extraVouchers.js';

const router = express.Router();

// Health check route
router.use('/health', healthRoutes);

// API routes
router.use('/companies', companiesRoutes);
router.use('/vouchers', voucherRoutes);
router.use('/reports', reportRoutes);
router.use('/meals', mealsRoutes);
router.use('/users', usersRoutes);
router.use('/extra-vouchers', extraVouchersRoutes);

export default router;