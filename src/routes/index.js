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
  logger.info(`Rota acessada: ${req.method} ${req.baseUrl}${req.path}`);
  next();
});

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

// Adicionar middleware para tratar rotas não encontradas
router.use((req, res) => {
  logger.warn(`Rota não encontrada: ${req.method} ${req.baseUrl}${req.path}`);
  res.status(404).json({
    error: 'Rota não encontrada',
    path: `${req.baseUrl}${req.path}`,
    method: req.method
  });
});

// Middleware de tratamento de erros
router.use((err, req, res, next) => {
  logger.error('Erro na aplicação:', err);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Um erro inesperado ocorreu'
  });
});

export default router;