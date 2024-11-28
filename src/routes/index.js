import express from 'express';
import healthRoutes from './health.js';
import usuariosRoutes from './usuarios.js';
import empresasRoutes from './empresas.js';
import turnosRoutes from './turnos.js';
import vouchersRoutes from './vouchers.js';
import vouchersExtraRoutes from './vouchersExtra.js';
import imagensFundoRoutes from './imagensFundo.js';
import refeicaoRoutes from './refeicoes.js';
import relatoriosRoutes from './relatorios.js';
import adminRoutes from './admin.js';
import usuariosAdminRoutes from './usuariosAdmin.js';

const router = express.Router();

// Rotas públicas
router.use('/health', healthRoutes);
router.use('/usuarios', usuariosRoutes);
router.use('/empresas', empresasRoutes);
router.use('/turnos', turnosRoutes);
router.use('/vouchers', vouchersRoutes);
router.use('/vouchers-extra', vouchersExtraRoutes);
router.use('/imagens-fundo', imagensFundoRoutes);
router.use('/refeicoes', refeicaoRoutes);
router.use('/relatorios', relatoriosRoutes);
router.use('/admin', adminRoutes);
router.use('/usuarios-admin', usuariosAdminRoutes);

export default router;