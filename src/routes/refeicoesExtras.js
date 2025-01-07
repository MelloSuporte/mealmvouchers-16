import express from 'express';
import { supabase } from '../config/supabase';
import logger from '../config/logger';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('refeicoes_extras')
      .select(`
        *,
        usuarios (nome),
        tipos_refeicao (nome)
      `)
      .order('data_consumo', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    logger.error('Erro ao buscar refeições extras:', error);
    res.status(500).json({ error: 'Erro ao buscar refeições extras' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('refeicoes_extras')
      .insert(req.body)
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    logger.error('Erro ao criar refeição extra:', error);
    res.status(500).json({ error: 'Erro ao criar refeição extra' });
  }
});

export default router;