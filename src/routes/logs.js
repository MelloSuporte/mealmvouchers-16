import express from 'express';
import { supabase } from '../config/supabase';
import logger from '../config/logger';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { startDate, endDate, tipo, nivel } = req.body;
    
    let query = supabase
      .from('logs_sistema')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    
    if (endDate) {
      query = query.lte('created_at', endDate);
    }
    
    if (tipo) {
      query = query.eq('tipo', tipo);
    }
    
    if (nivel) {
      query = query.eq('nivel', nivel);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Erro ao buscar logs:', error);
      throw error;
    }

    res.json(data || []);
  } catch (error) {
    logger.error('Erro ao processar requisição de logs:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar logs',
      details: error.message
    });
  }
});

export default router;