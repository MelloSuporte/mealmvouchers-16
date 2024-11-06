import express from 'express';
import logger from '../config/logger.js';

const router = express.Router();

// List companies
router.get('/', async (req, res) => {
  try {
    const [companies] = await req.db.execute('SELECT * FROM empresas ORDER BY nome');
    res.json(companies);
  } catch (error) {
    logger.error('Error listing companies:', error);
    res.status(500).json({ error: 'Erro ao buscar empresas' });
  }
});

// Get company by ID
router.get('/:id', async (req, res) => {
  try {
    const [company] = await req.db.execute('SELECT * FROM empresas WHERE id = ?', [req.params.id]);
    if (company.length === 0) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }
    res.json(company[0]);
  } catch (error) {
    logger.error('Error fetching company:', error);
    res.status(500).json({ error: 'Erro ao buscar empresa' });
  }
});

// Create company
router.post('/', async (req, res) => {
  const { name, cnpj, logo } = req.body;
  
  try {
    if (!name || !cnpj) {
      return res.status(400).json({ error: 'Nome e CNPJ são obrigatórios' });
    }

    const [existingCompany] = await req.db.execute(
      'SELECT id FROM empresas WHERE cnpj = ?', 
      [cnpj]
    );
    
    if (existingCompany.length > 0) {
      return res.status(409).json({ error: 'CNPJ já cadastrado' });
    }

    const [result] = await req.db.execute(
      'INSERT INTO empresas (nome, cnpj, logo) VALUES (?, ?, ?)',
      [name, cnpj, logo]
    );

    res.status(201).json({ 
      id: result.insertId, 
      name, 
      cnpj, 
      logo,
      message: 'Empresa cadastrada com sucesso'
    });
  } catch (error) {
    logger.error('Error creating company:', error);
    res.status(500).json({ 
      error: 'Erro ao cadastrar empresa',
      details: error.message
    });
  }
});

// Update company
router.put('/:id', async (req, res) => {
  const { name, cnpj, logo } = req.body;
  try {
    if (!name || !cnpj) {
      return res.status(400).json({ error: 'Nome e CNPJ são obrigatórios' });
    }

    const [existingCompany] = await req.db.execute(
      'SELECT id FROM empresas WHERE cnpj = ? AND id != ?', 
      [cnpj, req.params.id]
    );
    
    if (existingCompany.length > 0) {
      return res.status(409).json({ error: 'CNPJ já cadastrado para outra empresa' });
    }

    await req.db.execute(
      'UPDATE empresas SET nome = ?, cnpj = ?, logo = ? WHERE id = ?',
      [name, cnpj, logo, req.params.id]
    );
    
    res.json({ 
      id: parseInt(req.params.id), 
      name, 
      cnpj, 
      logo,
      message: 'Empresa atualizada com sucesso'
    });
  } catch (error) {
    logger.error('Error updating company:', error);
    res.status(500).json({ error: 'Erro ao atualizar empresa' });
  }
});

// Delete company
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await req.db.execute('DELETE FROM empresas WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting company:', error);
    res.status(500).json({ error: 'Erro ao excluir empresa' });
  }
});

export default router;