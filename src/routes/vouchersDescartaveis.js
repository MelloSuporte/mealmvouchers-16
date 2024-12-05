import express from 'express';
import { generateDisposableVouchers } from '../controllers/vouchersDescartaveisController.js';

const router = express.Router();

// Rota para geração de vouchers descartáveis
router.post('/vouchers-descartaveis', (req, res, next) => {
  console.log('Rota de vouchers descartáveis acessada');
  generateDisposableVouchers(req, res, next);
});

export default router;