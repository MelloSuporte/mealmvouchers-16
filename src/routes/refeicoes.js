import express from 'express';
import logger from '../config/logger.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { name, startTime, endTime, value, isActive, maxUsersPerDay, toleranceMinutes } = req.body;
  
  try {
    const [result] = await req.db.execute(
      'INSERT INTO tipos_refeicao (nome, hora_inicio, hora_fim, valor, ativo, max_usuarios_por_dia, minutos_tolerancia) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, startTime, endTime, value, isActive, maxUsersPerDay, toleranceMinutes]
    );
    
    res.status(201).json({ 
      success: true, 
      id: result.insertId,
      message: 'Refeição cadastrada com sucesso'
    });
  } catch (error) {
    logger.error('Error creating meal:', error);
    res.status(500).json({ error: 'Erro ao cadastrar refeição' });
  }
});

// Get all meals
router.get('/', async (req, res) => {
  try {
    const [rows] = await req.db.execute('SELECT * FROM tipos_refeicao ORDER BY nome');
    res.json(rows);
  } catch (error) {
    logger.error('Error fetching meals:', error);
    res.status(500).json({ error: 'Erro ao buscar refeições' });
  }
});

export default router;