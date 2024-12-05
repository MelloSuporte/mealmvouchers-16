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
import logger from '../config/logger.js';

const router = express.Router();

// Middleware de logging para todas as rotas
router.use((req, res, next) => {
  logger.info(`Rota acessada: ${req.method} ${req.path}`);
  next();
});

// Montagem das rotas
router.use('/api/empresas', empresasRoutes);
router.use('/api/usuarios', usuariosRoutes);
router.use('/api/turnos', turnosRoutes);
router.use('/api/refeicoes', refeicaoRoutes);
router.use('/api/usuarios-admin', usuariosAdminRoutes);
router.use('/api/vouchers', vouchersRoutes);
router.use('/api/vouchers-extra', vouchersExtraRoutes);
router.use('/api/vouchers-descartaveis', vouchersDescartaveisRoutes);
router.use('/api/imagens-fundo', imagensFundoRoutes);
router.use('/api/relatorios', relatoriosRoutes);
router.use('/api/reports', reportsRoutes);
router.use('/api/health', healthRoutes);

logger.info('Todas as rotas foram montadas com sucesso');

export default router;