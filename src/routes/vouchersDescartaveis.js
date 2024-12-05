import express from 'express';
import { generateDisposableVouchers } from '../controllers/vouchersDescartaveisController.js';
import logger from '../config/logger.js';

const router = express.Router();

// Adiciona logging para debug
router.use((req, res, next) => {
  logger.info('Requisição para vouchers descartáveis:', {
    method: req.method,
    path: req.path,
    body: req.body
  });
  next();
});

router.post('/', generateDisposableVouchers);

export default router;