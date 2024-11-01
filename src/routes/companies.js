import express from 'express';
import logger from '../config/logger.js';

const router = express.Router();

// List companies
router.get('/', async (req, res) => {
  const db = req.db;
  try {
    const [companies] = await db.execute('SELECT * FROM companies ORDER BY name');
    res.json(companies);
  } catch (error) {
    logger.error('Error fetching companies:', error);
    res.status(500).json({ error: 'Error fetching companies' });
  }
});

// Create company
router.post('/', async (req, res) => {
  const db = req.db;
  const { name, cnpj, logo } = req.body;
  
  if (!name || !cnpj) {
    return res.status(400).json({ error: 'Nome e CNPJ são obrigatórios' });
  }
  
  try {
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
      message: 'Empresa cadastrada com sucesso'
    });
  } catch (error) {
    logger.error('Error creating company:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'CNPJ já cadastrado' });
    }
    
    res.status(500).json({ error: 'Erro ao cadastrar empresa' });
  }
});

export default router;