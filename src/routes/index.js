import express from 'express';
import empresasRoutes from './empresas.js';
import voucherRoutes from './vouchers.js';
import relatoriosRoutes from './relatorios.js';
import healthRoutes from './health.js';
import refeicoesRoutes from './refeicoes.js';
import usuariosRoutes from './usuarios.js';
import vouchersExtraRoutes from './vouchersExtra.js';
import imagensFundoRoutes from './imagensFundo.js';
import configuracoesTurnosRoutes from './configuracoesTurnos.js';

const router = express.Router();

// Health check route
router.use('/health', healthRoutes);

// API routes
router.use('/empresas', empresasRoutes);
router.use('/vouchers', voucherRoutes);
router.use('/relatorios', relatoriosRoutes);
router.use('/refeicoes', refeicoesRoutes);
router.use('/usuarios', usuariosRoutes);
router.use('/vouchers-extra', vouchersExtraRoutes);
router.use('/imagens-fundo', imagensFundoRoutes);
router.use('/shift-configurations', configuracoesTurnosRoutes);

export default router;