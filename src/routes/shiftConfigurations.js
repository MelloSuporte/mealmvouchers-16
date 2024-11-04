import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Buscar todas as configurações de turno
router.get('/', async (req, res) => {
  try {
    const [rows] = await req.db.query('SELECT * FROM shift_configurations ORDER BY id');
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar configurações de turno:', error);
    res.status(500).json({ error: error.message });
  }
});

// Atualizar configurações de turno
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { start_time, end_time, is_active } = req.body;
  
  try {
    await req.db.query(
      'UPDATE shift_configurations SET start_time = ?, end_time = ?, is_active = ? WHERE id = ?',
      [start_time, end_time, is_active, id]
    );
    res.json({ message: 'Configurações atualizadas com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar configuração de turno:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;