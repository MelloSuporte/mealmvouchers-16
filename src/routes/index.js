import express from 'express';
import empresasRoutes from './empresas.js';
import usuariosRoutes from './usuarios.js';
import turnosRoutes from './turnos.js';
import refeicaoRoutes from './refeicoes.js';
import usuariosAdminRoutes from './usuariosAdmin.js';
import vouchersRoutes from './vouchers.js';
import vouchersExtraRoutes from './vouchersExtra.js';
import vouchersDescartaveisRoutes from './vouchersDescartaveis.js';
import imagensFundoRoutes from './imagensFundo.js';
import relatoriosRoutes from './relatorios.js';
import reportsRoutes from './reports.js';
import healthRoutes from './health.js';

const router = express.Router();

// Mount routes
router.use('/api', empresasRoutes);
router.use('/api', usuariosRoutes);
router.use('/api', turnosRoutes);
router.use('/api', refeicaoRoutes);
router.use('/api', usuariosAdminRoutes);
router.use('/api', vouchersRoutes);
router.use('/api', vouchersExtraRoutes);
router.use('/api', vouchersDescartaveisRoutes);
router.use('/api', imagensFundoRoutes);
router.use('/api', relatoriosRoutes);
router.use('/api', reportsRoutes);
router.use('/api', healthRoutes);

export default router;