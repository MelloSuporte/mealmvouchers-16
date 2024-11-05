import express from 'express';
import pool from '../config/database.js';
import logger from '../config/logger.js';

const router = express.Router();

// Get all shift configurations
router.get('/', async (req, res) => {
  try {
    const [rows] = await req.db.query('SELECT * FROM shift_configurations ORDER BY id');
    res.json(rows);
  } catch (error) {
    logger.error('Error fetching shift configurations:', error);
    res.status(500).json({ 
      error: 'Database error',
      message: 'Failed to fetch shift configurations'
    });
  }
});

// Update shift configuration
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { start_time, end_time, is_active } = req.body;
  
  try {
    await req.db.query(
      'UPDATE shift_configurations SET start_time = ?, end_time = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [start_time, end_time, is_active, id]
    );
    
    const [updatedShift] = await req.db.query(
      'SELECT * FROM shift_configurations WHERE id = ?',
      [id]
    );
    
    if (updatedShift.length === 0) {
      return res.status(404).json({ error: 'Shift configuration not found' });
    }
    
    res.json(updatedShift[0]);
  } catch (error) {
    logger.error('Error updating shift configuration:', error);
    res.status(500).json({ 
      error: 'Database error',
      message: 'Failed to update shift configuration'
    });
  }
});

export default router;