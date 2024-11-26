import express from 'express';
import { supabase } from '../config/supabase.js';
import logger from '../config/logger.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { userId, dates } = req.body;

  try {
    if (!userId || !dates || !Array.isArray(dates)) {
      return res.status(400).json({ 
        error: 'Dados inválidos. Usuário e datas são obrigatórios.' 
      });
    }

    const { data: user } = await supabase
      .from('users')
      .select('id, nome')
      .eq('id', userId)
      .single();

    if (!user) {
      return res.status(404).json({ 
        error: 'Usuário não encontrado' 
      });
    }

    const vouchers = [];
    
    for (const date of dates) {
      const { data: voucher, error } = await supabase
        .from('extra_vouchers')
        .insert([{
          user_id: userId,
          valid_until: new Date(date).toISOString()
        }])
        .select()
        .single();

      if (error) {
        logger.error('Erro ao criar voucher extra:', error);
        throw error;
      }
      
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
    res.status(500).json({ 
      error: error.message || 'Erro ao criar vouchers extras'
    });
  }
});

export default router;