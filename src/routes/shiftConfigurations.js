import express from 'express';
import pool from '../config/database.js';
import logger from '../config/logger.js';

const router = express.Router();

// Get all shift configurations
router.get('/', async (req, res) => {
  try {
    const [rows] = await req.db.query(
      'SELECT * FROM configuracoes_turno ORDER BY id'
    );
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
    const [result] = await req.db.query(
      'UPDATE configuracoes_turno SET hora_inicio = ?, hora_fim = ?, ativo = ?, atualizado_em = CURRENT_TIMESTAMP WHERE id = ?',
      [start_time, end_time, is_active, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Shift configuration not found' });
    }
    
    const [updatedShift] = await req.db.query(
      'SELECT * FROM configuracoes_turno WHERE id = ?',
      [id]
    );
    
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