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

// Montagem das rotas
router.use('/empresas', empresasRoutes);
router.use('/usuarios', usuariosRoutes);
router.use('/turnos', turnosRoutes);
router.use('/refeicoes', refeicaoRoutes);
router.use('/usuarios-admin', usuariosAdminRoutes);
router.use('/vouchers', vouchersRoutes);
router.use('/vouchers-extra', vouchersExtraRoutes);
router.use('/vouchers-descartaveis', vouchersDescartaveisRoutes);
router.use('/imagens-fundo', imagensFundoRoutes);
router.use('/relatorios', relatoriosRoutes);
router.use('/reports', reportsRoutes);
router.use('/health', healthRoutes);

export default router;