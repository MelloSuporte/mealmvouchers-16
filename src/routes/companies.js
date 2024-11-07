import express from 'express';
import logger from '../config/logger.js';

const router = express.Router();

// List companies
router.get('/', async (req, res) => {
  try {
    const [companies] = await req.db.execute(
      'SELECT id, nome as name, cnpj, logo FROM empresas ORDER BY nome'
    );
    res.json(companies);
  } catch (error) {
    logger.error('Error listing companies:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar empresas',
      details: error.message 
    });
  }
});

// Get company by ID
router.get('/:id', async (req, res) => {
  try {
    const [company] = await req.db.execute(
      'SELECT id, nome as name, cnpj, logo FROM empresas WHERE id = ?',
      [req.params.id]
    );
    
    if (company.length === 0) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }
    
    res.json(company[0]);
  } catch (error) {
    logger.error('Error fetching company:', error);
    res.status(500).json({ error: 'Erro ao buscar empresa' });
  }
});

export default router;