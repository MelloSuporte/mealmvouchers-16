import express from 'express';
import { supabase } from '../config/supabase.js';
import logger from '../config/logger.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { nome, hora_inicio, hora_fim, valor, ativo = true } = req.body;
  
  try {
    logger.info('Creating meal type:', { nome, hora_inicio, hora_fim, valor });

    const { data: meal, error } = await supabase
      .from('tipos_refeicao')
      .insert([{
        nome,
        hora_inicio,
        hora_fim,
        valor,
        ativo
      }])
      .select()
      .single();

    if (error) {
      logger.error('Error creating meal type:', error);
      throw error;
    }

    res.status(201).json(meal);
  } catch (error) {
    logger.error('Error in meal type creation:', error);
    res.status(500).json({ 
      error: 'Erro ao criar tipo de refeição',
      details: error.message 
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const { data: meals, error } = await supabase
      .from('tipos_refeicao')
      .select('*')
      .order('nome');

    if (error) throw error;
    res.json(meals);
  } catch (error) {
    logger.error('Error fetching meals:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar tipos de refeição',
      details: error.message 
    });
  }
});

export default router;