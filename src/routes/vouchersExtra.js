import express from 'express';
import { createVoucherExtra, generateDisposableVouchers } from '../controllers/vouchersExtraController.js';

const router = express.Router();

router.post('/', createVoucherExtra);
router.post('/disposable', generateDisposableVouchers);

export default router;