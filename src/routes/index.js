import express from 'express';
import voucherRoutes from './vouchers.js';
import relatoriosRoutes from './relatorios.js';
import healthRoutes from './health.js';
import refeicoesRoutes from './refeicoes.js';
import empresasRoutes from './empresas.js';
import usuariosRoutes from './usuarios.js';
import vouchersExtraRoutes from './vouchersExtra.js';

const router = express.Router();

// Health check route
router.use('/health', healthRoutes);

// API routes
router.use('/companies', empresasRoutes);
router.use('/vouchers', voucherRoutes);
router.use('/reports', relatoriosRoutes);
router.use('/meals', refeicoesRoutes);
router.use('/users', usuariosRoutes);  // This maps /api/users to the usuarios routes
router.use('/extra-vouchers', vouchersExtraRoutes);

export default router;