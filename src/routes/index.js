import express from 'express';
import empresasRoutes from './empresas.js';
import voucherRoutes from './vouchers.js';
import relatoriosRoutes from './relatorios.js';
import healthRoutes from './health.js';
import refeicoesRoutes from './refeicoes.js';
import usuariosRoutes from './usuarios.js';
import vouchersExtraRoutes from './vouchersExtra.js';
import imagensFundoRoutes from './imagensFundo.js';
import turnosRoutes from './turnos.js';
import usuariosAdminRoutes from './usuariosAdmin.js';

const router = express.Router();

// Health check route
router.use('/health', healthRoutes);

// Rotas da API sem prefixo /api
router.use('/empresas', empresasRoutes);
router.use('/vouchers', voucherRoutes);
router.use('/relatorios', relatoriosRoutes);
router.use('/refeicoes', refeicoesRoutes);
router.use('/usuarios', usuariosRoutes);
router.use('/vouchers-extra', vouchersExtraRoutes);
router.use('/imagens-fundo', imagensFundoRoutes);
router.use('/turnos', turnosRoutes);
router.use('/usuarios-admin', usuariosAdminRoutes);

export default router;