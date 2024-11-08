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
router.use('/api/companies', companiesRoutes); // Adicionado /api prefix
router.use('/vouchers', voucherRoutes);
router.use('/reports', reportRoutes);
router.use('/meals', mealsRoutes);
router.use('/users', usersRoutes);
router.use('/extra-vouchers', extraVouchersRoutes);
router.use('/background-images', backgroundImagesRoutes);
router.use('/shift-configurations', shiftConfigurationsRoutes);
router.use('/admin-users', adminUsersRoutes);

export default router;