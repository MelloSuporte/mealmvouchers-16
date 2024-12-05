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
router.use(empresasRoutes);
router.use(usuariosRoutes);
router.use(turnosRoutes);
router.use(refeicaoRoutes);
router.use(usuariosAdminRoutes);
router.use(vouchersRoutes);
router.use(vouchersExtraRoutes);
router.use(vouchersDescartaveisRoutes);
router.use(imagensFundoRoutes);
router.use(relatoriosRoutes);
router.use(reportsRoutes);
router.use(healthRoutes);

export default router;