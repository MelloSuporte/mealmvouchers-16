import express from 'express';
import { createVoucherExtra } from '../controllers/vouchersExtraController.js';

const router = express.Router();

router.post('/', createVoucherExtra);

export default router;