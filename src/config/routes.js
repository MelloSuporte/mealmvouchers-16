import express from 'express';
import empresasRoutes from '../routes/empresas.js';
import voucherRoutes from '../routes/vouchers.js';
import relatoriosRoutes from '../routes/relatorios.js';
import healthRoutes from '../routes/health.js';
import refeicoesRoutes from '../routes/refeicoes.js';
import usuariosRoutes from '../routes/usuarios.js';
import vouchersExtraRoutes from '../routes/vouchersExtra.js';
import imagensFundoRoutes from '../routes/imagensFundo.js';
import turnosRoutes from '../routes/turnos.js';
import usuariosAdminRoutes from '../routes/usuariosAdmin.js';
import adminRoutes from '../routes/admin.js';

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
router.use('/api/imagens-fundo', imagensFundoRoutes);
router.use('/api/turnos', turnosRoutes);
router.use('/api/usuarios-admin', usuariosAdminRoutes);

export default router;