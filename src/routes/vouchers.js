import express from 'express';
import { validateVoucher } from '../controllers/voucherController.js';

const router = express.Router();

router.post('/validate', validateVoucher);

export default router;