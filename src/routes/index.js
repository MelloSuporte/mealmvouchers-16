import express from 'express';
import vouchersRouter from './vouchers.js';
import vouchersExtraRouter from './vouchersExtra.js';

const router = express.Router();

router.use('/vouchers', vouchersRouter);
router.use('/vouchers-extra', vouchersExtraRouter);

export default router;
