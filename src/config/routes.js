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

const router = express.Router();

// Health check route
router.use('/health', healthRoutes);

// API routes - Note: removing the /api prefix since it's already added in the main app configuration
router.use('/', companiesRoutes);
router.use('/', voucherRoutes);
router.use('/', reportRoutes);
router.use('/', mealsRoutes);  // Changed to use root path since endpoints are defined in the route file
router.use('/', usersRoutes);
router.use('/', extraVouchersRoutes);
router.use('/', backgroundImagesRoutes);
router.use('/', shiftConfigurationsRoutes);

export default router;