import express from 'express';
import { supabase } from '../config/supabase.js';
import logger from '../config/logger.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { name, startTime, endTime, value, isActive, maxUsersPerDay, toleranceMinutes } = req.body;
  
  try {
    const { data: meal, error } = await supabase
      .from('meal_types')
      .insert([{
        name,
        start_time: startTime,
        end_time: endTime,
        value,
        is_active: isActive,
        max_users_per_day: maxUsersPerDay,
        tolerance_minutes: toleranceMinutes
      }])
      .select()
      .single();

    if (error) throw error;
    
    res.status(201).json({ 
      success: true, 
      id: meal.id,
      message: 'Refeição cadastrada com sucesso'
    });
  } catch (error) {
    logger.error('Error creating meal:', error);
    res.status(500).json({ error: 'Erro ao cadastrar refeição' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { data: meals, error } = await supabase
      .from('meal_types')
      .select('*')
      .order('name');

    if (error) throw error;
    
    res.json(meals);
  } catch (error) {
    logger.error('Error fetching meals:', error);
    res.status(500).json({ error: 'Erro ao buscar refeições' });
  }
});

export default router;