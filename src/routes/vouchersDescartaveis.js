import express from 'express';
import { generateDisposableVouchers } from '../controllers/vouchersDescartaveisController.js';

const router = express.Router();

// Rota para geração de vouchers descartáveis
router.post('/api/vouchers-descartaveis', generateDisposableVouchers);

export default router;