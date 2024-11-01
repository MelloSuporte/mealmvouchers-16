import express from 'express';
import pool from '../config/database.js';
import logger from '../config/logger.js';

const router = express.Router();

router.get('/', async (req, res) => {
  let db;
  try {
    db = await pool.getConnection();
    const [companies] = await db.execute('SELECT * FROM companies ORDER BY name');
    res.json(companies);
  } catch (error) {
    logger.error('Error fetching companies:', error);
    res.status(500).json({ 
      error: 'Error fetching companies. Please try again.' 
    });
  } finally {
    if (db) db.release();
  }
});

router.post('/', async (req, res) => {
  const { name, cnpj, logo } = req.body;
  let db;
  
  try {
    db = await pool.getConnection();
    const [result] = await db.execute(
      'INSERT INTO companies (name, cnpj, logo) VALUES (?, ?, ?)',
      [name, cnpj, logo]
    );
    
    res.status(201).json({ 
      id: result.insertId, 
      name, 
      cnpj, 
      logo,
      success: true,
      message: 'Company registered successfully'
    });
  } catch (error) {
    logger.error('Error creating company:', error);
    res.status(500).json({ 
      error: 'Error registering company. Please try again.' 
    });
  } finally {
    if (db) db.release();
  }
});

export default router;