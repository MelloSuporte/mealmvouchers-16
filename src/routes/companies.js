import express from 'express';
import pool from '../config/database.js';
import logger from '../config/logger.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { name, cnpj, logo } = req.body;
  
  try {
    const db = await pool.getConnection();
    const [result] = await db.execute(
      'INSERT INTO companies (name, cnpj, logo) VALUES (?, ?, ?)',
      [name, cnpj, logo]
    );
    
    res.status(201).json({ 
      id: result.insertId, 
      name, 
      cnpj, 
      logo 
    });
    
    db.release();
  } catch (error) {
    logger.error('Error creating company:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;