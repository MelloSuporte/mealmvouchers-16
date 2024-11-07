import express from 'express';
import companiesRoutes from './companies.js';
import voucherRoutes from './vouchers.js';
import relatoriosRoutes from './relatorios.js';
import healthRoutes from './health.js';
import refeicoesRoutes from './refeicoes.js';
import usuariosRoutes from './usuarios.js';
import vouchersExtraRoutes from './vouchersExtra.js';
import backgroundImagesRoutes from './backgroundImages.js';
import shiftConfigurationsRoutes from './shiftConfigurations.js';

const router = express.Router();

// Health check route
router.use('/health', healthRoutes);

// API routes
router.use('/companies', companiesRoutes);
router.use('/vouchers', voucherRoutes);
router.use('/reports', relatoriosRoutes);
router.use('/meals', refeicoesRoutes);
router.use('/users', usuariosRoutes);
router.use('/extra-vouchers', vouchersExtraRoutes);
router.use('/background-images', backgroundImagesRoutes);
router.use('/shift-configurations', shiftConfigurationsRoutes);

export default router;