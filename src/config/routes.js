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
router.use('/empresas', empresasRoutes);
router.use('/vouchers', voucherRoutes);
router.use('/relatorios', relatoriosRoutes);
router.use('/refeicoes', refeicoesRoutes);
router.use('/usuarios', usuariosRoutes);
router.use('/vouchers-extra', vouchersExtraRoutes);
router.use('/imagens-fundo', imagensFundoRoutes); // Garantindo que a rota existe
router.use('/turnos', turnosRoutes);
router.use('/usuarios-admin', usuariosAdminRoutes);

export default router;