import express from 'express';
import { generateDisposableVouchers } from '../controllers/vouchersDescartaveisController.js';

const router = express.Router();

// Rota base já é /api/vouchers-descartaveis
router.post('/', generateDisposableVouchers);

export default router;