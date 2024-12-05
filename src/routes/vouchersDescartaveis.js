import express from 'express';
import { generateDisposableVouchers } from '../controllers/vouchersDescartaveisController.js';

const router = express.Router();

router.post('/vouchers-descartaveis', generateDisposableVouchers);

export default router;