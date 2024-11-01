import express from 'express';
import logger from '../config/logger.js';

const router = express.Router();

// List companies
router.get('/', async (req, res) => {
  try {
    const [companies] = await req.db.execute('SELECT * FROM companies ORDER BY name');
    res.json(companies);
  } catch (error) {
    logger.error('Error fetching companies:', error);
    res.status(500).json({ error: 'Error fetching companies' });
  }
});

// Create company
router.post('/', async (req, res) => {
  const { name, cnpj, logo } = req.body;
  
  try {
    const [result] = await req.db.execute(
      'INSERT INTO companies (name, cnpj, logo) VALUES (?, ?, ?)',
      [name, cnpj, logo]
    );
    
    res.status(201).json({ 
      id: result.insertId, 
      name, 
      cnpj, 
      logo,
      success: true,
      message: 'Empresa cadastrada com sucesso'
    });
  } catch (error) {
    logger.error('Error creating company:', error);
    res.status(500).json({ error: 'Erro ao cadastrar empresa' });
  }
});

export default router;