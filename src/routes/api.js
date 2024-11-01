import express from 'express';
import companiesRoutes from './companies.js';
import voucherRoutes from './vouchers.js';
import reportRoutes from './reports.js';
import healthRoutes from './health.js';
import mealsRoutes from './meals.js';
import usersRoutes from './users.js';
import extraVouchersRoutes from './extraVouchers.js';

const router = express.Router();

// Rota de health check
router.use('/health', healthRoutes);

// Rotas da API
router.use('/companies', companiesRoutes);
router.use('/vouchers', voucherRoutes);
router.use('/reports', reportRoutes);
router.use('/meals', mealsRoutes);
router.use('/users', usersRoutes);
router.use('/extra-vouchers', extraVouchersRoutes);

export default router;