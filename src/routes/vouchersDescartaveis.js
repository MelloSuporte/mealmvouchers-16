import express from 'express';
import { generateDisposableVouchers } from '../controllers/vouchersDescartaveisController.js';

const router = express.Router();

router.post('/', generateDisposableVouchers);

export default router;