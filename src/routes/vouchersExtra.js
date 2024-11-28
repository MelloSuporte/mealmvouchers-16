import express from 'express';
import { createVoucherExtra } from '../controllers/vouchersExtraController.js';

const router = express.Router();

// Rota POST para criar vouchers extras
router.post('/', createVoucherExtra);

export default router;