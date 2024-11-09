import express from 'express';
import { supabase } from '../config/supabase.js';
import logger from '../config/logger.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { name, startTime, endTime, value, isActive = true, maxUsersPerDay, toleranceMinutes = 15 } = req.body;
  
  try {
    logger.info('Creating meal type:', { name, startTime, endTime, value });

    const { data: meal, error } = await supabase
      .from('tipos_refeicao')
      .insert([{
        nome: name,
        hora_inicio: startTime,
        hora_fim: endTime,
        valor: value,
        ativo: isActive,
        max_usuarios_por_dia: maxUsersPerDay,
        minutos_tolerancia: toleranceMinutes
      }])
      .select()
      .single();

    if (error) {
      logger.error('Error creating meal type:', error);
      throw error;
    }

    res.status(201).json({ success: true, data: meal });
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

router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;

  try {
    const { data, error } = await supabase
      .from('tipos_refeicao')
      .update({ ativo: is_active })
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    logger.error('Error updating meal status:', error);
    res.status(500).json({ 
      error: 'Erro ao atualizar status da refeição',
      details: error.message 
    });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabase
      .from('tipos_refeicao')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    logger.error('Error deleting meal:', error);
    res.status(500).json({ 
      error: 'Erro ao deletar refeição',
      details: error.message 
    });
  }
});

export default router;