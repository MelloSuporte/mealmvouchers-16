import express from 'express';
import empresasRoutes from './empresas.js';
import voucherRoutes from './vouchers.js';
import relatoriosRoutes from './relatorios.js';
import healthRoutes from './health.js';
import refeicoesRoutes from './refeicoes.js';
import usuariosRoutes from './usuarios.js';
import vouchersExtraRoutes from './vouchersExtra.js';
import adminRoutes from './admin.js';

const router = express.Router();

// Health check route
router.use('/health', healthRoutes);

// API routes
router.use('/empresas', empresasRoutes);
router.use('/vouchers', voucherRoutes);
router.use('/relatorios', relatoriosRoutes);
router.use('/refeicoes', refeicoesRoutes);  // Corrigido: adicionado o prefixo correto
router.use('/users', usuariosRoutes);
router.use('/vouchers-extra', vouchersExtraRoutes);
router.use('/admin', adminRoutes);

export default router;