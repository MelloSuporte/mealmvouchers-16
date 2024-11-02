import express from 'express';
import pool from '../config/database.js';
import logger from '../config/logger.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const db = await pool.getConnection();
    const [results] = await db.execute(
      'SELECT * FROM meal_types WHERE is_active = TRUE ORDER BY start_time'
    );
    db.release();
    res.json(results);
  } catch (error) {
    logger.error('Error fetching meals:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  const { name, startTime, endTime, value, isActive, maxUsersPerDay, toleranceMinutes } = req.body;
  
  try {
    const db = await pool.getConnection();
    const [result] = await db.execute(
      'INSERT INTO meal_types (name, start_time, end_time, value, is_active, max_users_per_day, tolerance_minutes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, startTime, endTime, value, isActive ?? true, maxUsersPerDay || null, toleranceMinutes || 15]
    );
    db.release();
    
    res.status(201).json({ 
      success: true, 
      id: result.insertId,
      message: 'Refeição cadastrada com sucesso'
    });
  } catch (error) {
    logger.error('Error creating meal:', error);
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;
  
  try {
    const db = await pool.getConnection();
    await db.execute(
      'UPDATE meal_types SET is_active = ? WHERE id = ?',
      [is_active, id]
    );
    db.release();
    res.json({ success: true });
  } catch (error) {
    logger.error('Error updating meal:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;