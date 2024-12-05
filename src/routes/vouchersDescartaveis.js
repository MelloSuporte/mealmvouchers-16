import express from 'express';
import { generateDisposableVouchers } from '../controllers/vouchersDescartaveisController.js';
import logger from '../config/logger.js';

const router = express.Router();

// Middleware de logging para debug
router.use((req, res, next) => {
  logger.info('Requisição para vouchers descartáveis:', {
    method: req.method,
    path: req.path,
    body: req.body
  });
  next();
});

// Rota POST para gerar vouchers descartáveis
router.post('/', async (req, res) => {
  try {
    logger.info('Recebida requisição POST para gerar vouchers:', req.body);
    await generateDisposableVouchers(req, res);
  } catch (error) {
    logger.error('Erro ao processar requisição:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao gerar vouchers descartáveis'
    });
  }
});

export default router;