import express from 'express';
import { createVoucherExtra } from '../controllers/vouchersExtraController.js';

const router = express.Router();

router.post('/vouchers-extra', createVoucherExtra);

export default router;