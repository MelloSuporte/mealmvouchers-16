import express from 'express';
import adminRoutes from './admin';
import empresasRoutes from './empresas';
import healthRoutes from './health';
import imagensFundoRoutes from './imagensFundo';
import refeicaoRoutes from './refeicoes';
import relatoriosRoutes from './relatorios';
import turnosRoutes from './turnos';
import usuariosRoutes from './usuarios';
import usuariosAdminRoutes from './usuariosAdmin';
import vouchersRoutes from './vouchers';
import vouchersDescartaveisRoutes from './vouchersDescartaveis';
import vouchersExtraRoutes from './vouchersExtra';
import refeicoesExtrasRoutes from './refeicoesExtras';
import logsRoutes from './logs';

const router = express.Router();

router.use('/admin', adminRoutes);
router.use('/empresas', empresasRoutes);
router.use('/health', healthRoutes);
router.use('/imagens-fundo', imagensFundoRoutes);
router.use('/refeicoes', refeicaoRoutes);
router.use('/refeicoes-extras', refeicoesExtrasRoutes);
router.use('/relatorios', relatoriosRoutes);
router.use('/turnos', turnosRoutes);
router.use('/usuarios', usuariosRoutes);
router.use('/usuarios-admin', usuariosAdminRoutes);
router.use('/vouchers', vouchersRoutes);
router.use('/vouchers-descartaveis', vouchersDescartaveisRoutes);
router.use('/vouchers-extra', vouchersExtraRoutes);
router.use('/logs', logsRoutes);

export default router;