import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Get all shift configurations
router.get('/', async (req, res) => {
  try {
    const [rows] = await req.db.query('SELECT * FROM shift_configurations ORDER BY id');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching shift configurations:', error);
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
      'UPDATE shift_configurations SET start_time = ?, end_time = ?, is_active = ? WHERE id = ?',
      [start_time, end_time, is_active, id]
    );
    res.json({ message: 'Shift configuration updated successfully' });
  } catch (error) {
    console.error('Error updating shift configuration:', error);
    res.status(500).json({ 
      error: 'Database error',
      message: 'Failed to update shift configuration'
    });
  }
});

export default router;