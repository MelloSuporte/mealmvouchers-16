import express from 'express';
import { generateDisposableVouchers } from '../controllers/vouchersDescartaveisController.js';

const router = express.Router();

// Removendo o prefixo /api pois já está configurado no express.js
router.post('/vouchers-descartaveis', generateDisposableVouchers);

export default router;