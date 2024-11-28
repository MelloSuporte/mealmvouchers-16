import express from 'express';
import adminRoutes from './admin.js';
import empresasRoutes from './empresas.js';
import healthRoutes from './health.js';
import imagensFundoRoutes from './imagensFundo.js';
import refeicoesRoutes from './refeicoes.js';
import relatoriosRoutes from './relatorios.js';
import reportsRoutes from './reports.js';
import turnosRoutes from './turnos.js';
import usuariosRoutes from './usuarios.js';
import usuariosAdminRoutes from './usuariosAdmin.js';
import vouchersRoutes from './vouchers.js';
import vouchersExtraRoutes from './vouchersExtra.js';

const router = express.Router();

// Montagem das rotas
router.use('/admin', adminRoutes);
router.use('/empresas', empresasRoutes);
router.use('/health', healthRoutes);
router.use('/imagens-fundo', imagensFundoRoutes);
router.use('/refeicoes', refeicoesRoutes);
router.use('/relatorios', relatoriosRoutes);
router.use('/reports', reportsRoutes);
router.use('/turnos', turnosRoutes);
router.use('/usuarios', usuariosRoutes);
router.use('/usuarios-admin', usuariosAdminRoutes);
router.use('/vouchers', vouchersRoutes);
router.use('/vouchers-extra', vouchersExtraRoutes);

export default router;