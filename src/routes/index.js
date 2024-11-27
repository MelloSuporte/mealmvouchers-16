import express from 'express';
import vouchersExtraRouter from './vouchersExtra.js';
import vouchersRouter from './vouchers.js';

const router = express.Router();

router.use('/vouchers-extra', vouchersExtraRouter);
router.use('/vouchers', vouchersRouter);

export default router;