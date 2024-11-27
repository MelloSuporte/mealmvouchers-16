import express from 'express';
import adminRoutes from './admin.js';
import empresasRoutes from './empresas.js';
import usuariosRoutes from './usuarios.js';
import usuariosAdminRoutes from './usuariosAdmin.js';
import vouchersRoutes from './vouchers.js';
import vouchersExtraRoutes from './vouchersExtra.js';
import refeicoesRoutes from './refeicoes.js';
import turnosRoutes from './turnos.js';
import relatoriosRoutes from './relatorios.js';
import imagensFundoRoutes from './imagensFundo.js';
import healthRoutes from './health.js';

const router = express.Router();

router.use('/admin', adminRoutes);
router.use('/empresas', empresasRoutes);
router.use('/usuarios', usuariosRoutes);
router.use('/usuarios-admin', usuariosAdminRoutes);
router.use('/vouchers', vouchersRoutes);
router.use('/vouchers-extra', vouchersExtraRoutes);
router.use('/refeicoes', refeicoesRoutes);
router.use('/turnos', turnosRoutes);
router.use('/relatorios', relatoriosRoutes);
router.use('/imagens-fundo', imagensFundoRoutes);
router.use('/health', healthRoutes);

export default router;