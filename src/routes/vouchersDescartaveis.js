import express from 'express';
import { generateDisposableVouchers } from '../controllers/vouchersDescartaveisController.js';

const router = express.Router();

router.post('/api/vouchers-descartaveis', generateDisposableVouchers);

export default router;