import express from 'express';
import { supabase } from '../config/supabase.js';
import logger from '../config/logger.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { user_id, dates } = req.body;

  try {
    if (!user_id || !dates || !Array.isArray(dates)) {
      return res.status(400).json({ 
        error: 'Dados inválidos. Usuário e datas são obrigatórios.' 
      });
    }

    const { data: user } = await supabase
      .from('usuarios')
      .select('id, nome')
      .eq('id', user_id)
      .single();

    if (!user) {
      return res.status(404).json({ 
        error: 'Usuário não encontrado' 
      });
    }

    const vouchers = [];
    
    for (const date of dates) {
      const { data: voucher, error } = await supabase
        .from('vouchers_extras')
        .insert([{
          usuario_id: user_id,
          autorizado_por: 'Sistema', // Pode ser alterado para pegar o usuário autenticado
          valido_ate: new Date(date).toISOString()
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