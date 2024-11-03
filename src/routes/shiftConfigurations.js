import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Buscar todas as configurações de turno
router.get('/', async (req, res) => {
  try {
    const [rows] = await req.db.query('SELECT * FROM shift_configurations ORDER BY id');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Atualizar configurações de turno
router.put('/', async (req, res) => {
  const turnos = req.body;
  
  try {
    for (const turno of turnos) {
      await req.db.query(
        'UPDATE shift_configurations SET start_time = ?, end_time = ? WHERE id = ?',
        [turno.start_time, turno.end_time, turno.id]
      );
    }
    res.json({ message: 'Configurações atualizadas com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;