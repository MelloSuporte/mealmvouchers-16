import express from 'express';
import vouchersExtraRouter from './vouchersExtra';
import vouchersRouter from './vouchers';

const router = express.Router();

// Registrar a rota de vouchers extras
router.use('/vouchers-extra', vouchersExtraRouter);

router.use('/vouchers', vouchersRouter);

export default router;