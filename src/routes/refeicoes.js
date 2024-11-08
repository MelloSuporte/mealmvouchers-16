import express from 'express';
import { supabase } from '../config/supabase.js';
import logger from '../config/logger.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { name, start_time, end_time, value, is_active = true } = req.body;
  
  try {
    logger.info('Creating meal type:', { name, start_time, end_time, value, is_active });

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

    if (error) {
      logger.error('Supabase error:', error);
      throw error;
    }

    logger.info('Meal type created successfully:', meal);
    res.status(201).json(meal);
  } catch (error) {
    logger.error('Error creating meal:', error);
    res.status(500).json({ 
      error: 'Erro ao criar tipo de refeição',
      details: error.message 
    });
  }
});

router.get('/', async (req, res) => {
  try {
    logger.info('Fetching meal types');
    
    const { data: refeicoes, error } = await supabase
      .from('tipos_refeicao')
      .select('*')
      .order('nome');

    if (error) {
      logger.error('Supabase error:', error);
      throw error;
    }

    logger.info(`Found ${refeicoes?.length || 0} meal types`);
    res.json(refeicoes);
  } catch (error) {
    logger.error('Error fetching meals:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar tipos de refeição',
      details: error.message 
    });
  }
});

export default router;