import express from 'express';
import logger from '../config/logger.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { cpf } = req.query;
  
  try {
    let query = 'SELECT * FROM admin_users';
    let params = [];
    
    if (cpf) {
      query += ' WHERE cpf = ?';
      params.push(cpf);
    }
    
    const [rows] = await req.db.execute(query, params);
    
    res.json(rows);
  } catch (error) {
    logger.error('Error fetching admin users:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários administradores' });
  }
});

export default router;