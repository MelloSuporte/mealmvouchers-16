import express from 'express';
import voucherRoutes from './vouchers.js';
import relatoriosRoutes from './relatorios.js';
import healthRoutes from './health.js';
import refeicoesRoutes from './refeicoes.js';
import empresasRoutes from './empresas.js';
import usuariosRoutes from './usuarios.js';
import vouchersExtraRoutes from './vouchersExtra.js';

export const configureRoutes = (app) => {
  // Health check route
  app.use('/health', healthRoutes);
  
  // API routes with /api prefix
  const apiRouter = express.Router();
  
  apiRouter.use('/vouchers', voucherRoutes);
  apiRouter.use('/relatorios', relatoriosRoutes);
  apiRouter.use('/refeicoes', refeicoesRoutes);
  apiRouter.use('/empresas', empresasRoutes);
  apiRouter.use('/usuarios', usuariosRoutes);
  apiRouter.use('/vouchers-extra', vouchersExtraRoutes);
  
  // Mount all API routes under /api
  app.use('/api', apiRouter);
};