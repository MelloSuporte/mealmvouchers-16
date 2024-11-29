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

router.use(vouchersRouter);
router.use(vouchersExtraRouter);
router.use(vouchersDescartaveisRouter);
router.use(empresasRouter);
router.use(usuariosRouter);
router.use(usuariosAdminRouter);
router.use(turnosRouter);
router.use(imagensFundoRouter);
router.use(relatoriosRouter);
router.use(healthRouter);
router.use(adminRouter);

export default router;