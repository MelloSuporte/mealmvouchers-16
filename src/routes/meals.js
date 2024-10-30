import express from 'express';
import pool from '../config/database.js';
import logger from '../config/logger.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const db = await pool.getConnection();
    const [results] = await db.execute('SELECT * FROM meal_types ORDER BY start_time');
    res.json(results);
  } catch (error) {
    logger.error('Error fetching meals:', error);
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
    res.json({ success: true });
  } catch (error) {
    logger.error('Error updating meal:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;