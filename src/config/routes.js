import express from 'express';
import companiesRoutes from '../routes/companies.js';
import voucherRoutes from '../routes/vouchers.js';
import reportRoutes from '../routes/relatorios.js';
import healthRoutes from '../routes/health.js';
import mealsRoutes from '../routes/refeicoes.js';
import usersRoutes from '../routes/usuarios.js';
import extraVouchersRoutes from '../routes/vouchersExtra.js';
import backgroundImagesRoutes from '../routes/backgroundImages.js';
import shiftConfigurationsRoutes from '../routes/shiftConfigurations.js';
import adminUsersRoutes from '../routes/adminUsers.js';

const router = express.Router();

// Health check route
router.use('/health', healthRoutes);

// API routes
router.use('/api/companies', companiesRoutes);
router.use('/api/vouchers', voucherRoutes);
router.use('/api/reports', reportRoutes);
router.use('/api/meals', mealsRoutes);
router.use('/api/users', usersRoutes);
router.use('/api/extra-vouchers', extraVouchersRoutes);
router.use('/api/background-images', backgroundImagesRoutes);
router.use('/api/shift-configurations', shiftConfigurationsRoutes);
router.use('/api/admin-users', adminUsersRoutes);

export default router;