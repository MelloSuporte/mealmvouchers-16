import express from 'express';
import vouchersRouter from './vouchers.js';
import vouchersExtraRouter from './vouchersExtra.js';
import vouchersDescartaveisRouter from './vouchersDescartaveis.js';
import empresasRouter from './empresas.js';
import usuariosRouter from './usuarios.js';
import usuariosAdminRouter from './usuariosAdmin.js';
import turnosRouter from './turnos.js';
import imagensFundoRouter from './imagensFundo.js';
import relatoriosRouter from './relatorios.js';
import healthRouter from './health.js';
import adminRouter from './admin.js';

const router = express.Router();

router.use('/api', vouchersRouter);
router.use('/api', vouchersExtraRouter);
router.use('/api', vouchersDescartaveisRouter);
router.use('/api', empresasRouter);
router.use('/api', usuariosRouter);
router.use('/api', usuariosAdminRouter);
router.use('/api', turnosRouter);
router.use('/api', imagensFundoRouter);
router.use('/api', relatoriosRouter);
router.use('/api', healthRouter);
router.use('/api', adminRouter);

export default router;