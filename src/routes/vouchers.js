import express from 'express';
import { validateVoucher, validateDisposableVoucher } from '../controllers/voucherController';
import logger from '../config/logger.js';

const router = express.Router();

// Middleware para logging de requisições
router.use((req, res, next) => {
  logger.info(`Voucher validation attempt - CPF: ${req.body.cpf}, Type: ${req.body.mealType}`);
  next();
});

router.post('/validate', async (req, res) => {
  try {
    await validateVoucher(req, res);
  } catch (error) {
    logger.error('Voucher validation error:', error);
    res.status(500).json({ 
      error: 'Erro ao validar voucher. Por favor, tente novamente.',
      userName: null,
      turno: null
    });
  }
});

router.post('/validate-disposable', async (req, res) => {
  try {
    await validateDisposableVoucher(req, res);
  } catch (error) {
    logger.error('Disposable voucher validation error:', error);
    res.status(500).json({ error: 'Erro ao validar voucher descartável.' });
  }
});

export default router;