import express from 'express';
import empresasRoutes from './empresas.js';
import voucherRoutes from './vouchers.js';
import relatoriosRoutes from './relatorios.js';
import healthRoutes from './health.js';
import refeicoesRoutes from './refeicoes.js';
import usuariosRoutes from './usuarios.js';
import vouchersExtraRoutes from './vouchersExtra.js';
import imagensFundoRoutes from './imagensFundo.js';
import turnosRoutes from './turnos.js';
import usuariosAdminRoutes from './usuariosAdmin.js';
import adminRoutes from './admin.js';

const router = express.Router();

// Health check route
router.use('/health', healthRoutes);

// Admin routes
router.use('/admin', adminRoutes);

// API routes
router.use('/api/empresas', empresasRoutes);
router.use('/api/vouchers', voucherRoutes);
router.use('/api/relatorios', relatoriosRoutes);
router.use('/api/refeicoes', refeicoesRoutes);
router.use('/api/usuarios', usuariosRoutes);
router.use('/api/vouchers-extra', vouchersExtraRoutes);
router.use('/api/imagens-fundo', imagensFundoRoutes); // Adicionando o prefixo /api
router.use('/api/turnos', turnosRoutes);
router.use('/api/usuarios-admin', usuariosAdminRoutes);

export default router;