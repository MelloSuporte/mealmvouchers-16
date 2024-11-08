import { supabase } from '../config/database.js';
import logger from '../config/logger.js';

const MAINTENANCE_MODE = process.env.MAINTENANCE_MODE === 'true';

const checkMaintenanceMode = (req, res, next) => {
  if (MAINTENANCE_MODE) {
    logger.warn('Tentativa de modificação durante modo manutenção:', {
      path: req.path,
      method: req.method,
      user: req.user
    });
    return res.status(503).json({
      error: "Sistema em manutenção",
      message: "Esta funcionalidade está temporariamente bloqueada para manutenção"
    });
  }
  return next();
};

export const getMeals = async (req, res) => {
  try {
    const { data: meals, error } = await supabase
      .from('meal_types')
      .select('*')
      .order('name');

    if (error) throw error;
    res.json(meals);
  } catch (error) {
    logger.error('Error fetching meals:', error);
    res.status(500).json({ error: 'Erro ao buscar refeições. Por favor, tente novamente.' });
  }
};

export const createMeal = async (req, res) => {
  if (checkMaintenanceMode(req, res, () => {})) return;

  const { name, startTime, endTime, value, isActive, maxUsersPerDay, toleranceMinutes } = req.body;
  
  try {
    const { data: meal, error } = await supabase
      .from('meal_types')
      .insert([{
        name,
        start_time: startTime,
        end_time: endTime,
        value,
        is_active: isActive ?? true,
        max_users_per_day: maxUsersPerDay || null,
        tolerance_minutes: toleranceMinutes || 15
      }])
      .select()
      .single();

    if (error) throw error;
    
    logger.info('Nova refeição cadastrada:', { id: meal.id, name });
    
    res.status(201).json({ 
      success: true, 
      id: meal.id,
      message: 'Refeição cadastrada com sucesso'
    });
  } catch (error) {
    logger.error('Error creating meal:', error);
    res.status(500).json({ error: 'Erro ao cadastrar refeição. Por favor, verifique os dados e tente novamente.' });
  }
};

export const updateMealStatus = async (req, res) => {
  if (checkMaintenanceMode(req, res, () => {})) return;

  const { id } = req.params;
  const { is_active } = req.body;
  
  try {
    const { error } = await supabase
      .from('meal_types')
      .update({ is_active })
      .eq('id', id);

    if (error) throw error;
    
    logger.info('Status da refeição atualizado:', { id, is_active });
    
    res.json({ success: true });
  } catch (error) {
    logger.error('Error updating meal:', error);
    res.status(500).json({ error: 'Erro ao atualizar status da refeição.' });
  }
};