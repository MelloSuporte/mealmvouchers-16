import express from 'express';
import vouchersRouter from './vouchers.js';
import usuariosRouter from './usuarios.js';
import empresasRouter from './empresas.js';
import turnosRouter from './turnos.js';
import refeicaoRouter from './refeicoes.js';
import relatoriosRouter from './relatorios.js';
import imagensFundoRouter from './imagensFundo.js';
import adminRouter from './admin.js';
import vouchersExtraRouter from './vouchersExtra.js';

const router = express.Router();

// Rotas principais do sistema
router.use('/vouchers', vouchersRouter);
router.use('/usuarios', usuariosRouter);
router.use('/empresas', empresasRouter);
router.use('/turnos', turnosRouter);
router.use('/refeicoes', refeicaoRouter);
router.use('/relatorios', relatoriosRouter);
router.use('/imagens-fundo', imagensFundoRouter);
router.use('/admin', adminRouter);
router.use('/vouchers-extra', vouchersExtraRouter);

export default router;