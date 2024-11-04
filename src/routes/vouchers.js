import express from 'express';
import { validateVoucher } from '../controllers/voucherController';
import { 
  checkVoucherCode, 
  createDisposableVoucher, 
  validateDisposableVoucher 
} from '../controllers/disposableVoucherController';
import logger from '../config/logger.js';

const router = express.Router();

// Middleware para logging de requisições
router.use((req, res, next) => {
  logger.info(`Voucher validation attempt - Method: ${req.method}, Path: ${req.path}`);
  next();
});

router.post('/validate', validateVoucher);
router.post('/validate-disposable', validateDisposableVoucher);
router.post('/check', checkVoucherCode);
router.post('/create', createDisposableVoucher);

export default router;