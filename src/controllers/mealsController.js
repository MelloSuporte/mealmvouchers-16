import pool from '../config/database.js';
import logger from '../config/logger.js';

export const getMeals = async (req, res) => {
  try {
    const [results] = await req.db.execute(
      'SELECT * FROM meal_types WHERE is_active = TRUE ORDER BY name'
    );
    res.json(results);
  } catch (error) {
    logger.error('Error fetching meals:', error);
    res.status(500).json({ error: error.message });
  }
};

export const createMeal = async (req, res) => {
  const { name, startTime, endTime, value, isActive, maxUsersPerDay, toleranceMinutes } = req.body;
  
  try {
    const [result] = await req.db.execute(
      'INSERT INTO meal_types (name, start_time, end_time, value, is_active, max_users_per_day, tolerance_minutes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, startTime, endTime, value, isActive ?? true, maxUsersPerDay || null, toleranceMinutes || 15]
    );
    
    res.status(201).json({ 
      success: true, 
      id: result.insertId,
      message: 'Refeição cadastrada com sucesso'
    });
  } catch (error) {
    logger.error('Error creating meal:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateMealStatus = async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;
  
  try {
    await req.db.execute(
      'UPDATE meal_types SET is_active = ? WHERE id = ?',
      [is_active, id]
    );
    res.json({ success: true });
  } catch (error) {
    logger.error('Error updating meal:', error);
    res.status(500).json({ error: error.message });
  }
};