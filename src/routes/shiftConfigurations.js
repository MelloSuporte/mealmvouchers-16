import express from 'express';
import logger from '../config/logger.js';

const router = express.Router();

// Get all shift configurations
router.get('/', async (req, res) => {
  try {
    const [rows] = await req.db.query(
      'SELECT * FROM configuracoes_turno ORDER BY tipo_turno'
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

// Create new shift configuration
router.post('/', async (req, res) => {
  const { tipo_turno, hora_inicio, hora_fim, ativo } = req.body;
  
  try {
    const [result] = await req.db.query(
      'INSERT INTO configuracoes_turno (tipo_turno, hora_inicio, hora_fim, ativo) VALUES (?, ?, ?, ?)',
      [tipo_turno, hora_inicio, hora_fim, ativo]
    );
    
    const [newShift] = await req.db.query(
      'SELECT * FROM configuracoes_turno WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json(newShift[0]);
  } catch (error) {
    logger.error('Error creating shift configuration:', error);
    res.status(500).json({ 
      error: 'Database error',
      message: 'Failed to create shift configuration'
    });
  }
});

// Update shift configuration
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { hora_inicio, hora_fim, ativo } = req.body;
  
  try {
    const [result] = await req.db.query(
      'UPDATE configuracoes_turno SET hora_inicio = ?, hora_fim = ?, ativo = ? WHERE id = ?',
      [hora_inicio, hora_fim, ativo, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Configuração de turno não encontrada' });
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