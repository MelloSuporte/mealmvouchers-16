import express from 'express';
import { supabase } from '../config/supabase.js';
import logger from '../config/logger.js';

const router = express.Router();

router.post('/meals', async (req, res) => {
  const { name, start_time, end_time, value, is_active } = req.body;
  
  try {
    const { data: meal, error } = await supabase
      .from('tipos_refeicao')
      .insert([{
        nome: name,
        hora_inicio: start_time,
        hora_fim: end_time,
        valor: value,
        ativo: is_active
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(meal);
  } catch (error) {
    logger.error('Error creating meal:', error);
    res.status(500).json({ error: 'Erro ao criar tipo de refeição' });
  }
});

router.get('/meals', async (req, res) => {
  try {
    const { data: refeicoes, error } = await supabase
      .from('tipos_refeicao')
      .select('*')
      .order('nome');

    if (error) throw error;

    res.json(refeicoes);
  } catch (error) {
    logger.error('Error fetching meals:', error);
    res.status(500).json({ error: 'Erro ao buscar tipos de refeição' });
  }
});

export default router;