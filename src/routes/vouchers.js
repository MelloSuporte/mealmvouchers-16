import express from 'express';
import { validateVoucher, validateDisposableVoucher } from '../controllers/voucherController';

const router = express.Router();

router.post('/validate', validateVoucher);
router.post('/validate-disposable', validateDisposableVoucher);

export default router;