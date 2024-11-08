import express from 'express';
import { supabase } from '../config/supabase.js';
import logger from '../config/logger.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { userId, dates } = req.body;

  try {
    const vouchers = [];
    
    for (const date of dates) {
      const { data: voucher, error } = await supabase
        .from('extra_vouchers')
        .insert([{
          user_id: userId,
          authorized_by: 1, // TODO: Get from authenticated user
          valid_until: new Date(date).toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      
      if (voucher) {
        vouchers.push(voucher);
      }
    }

    res.status(201).json({ 
      success: true,
      message: 'Vouchers extras criados com sucesso',
      vouchers: vouchers
    });
  } catch (error) {
    logger.error('Error creating extra vouchers:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;