import express from 'express';
import pool from '../config/database.js';
import logger from '../config/logger.js';

const router = express.Router();

// List companies
router.get('/', async (req, res) => {
  try {
    const [companies] = await pool.execute('SELECT * FROM companies ORDER BY name');
    res.json(companies);
  } catch (error) {
    logger.error('Error listing companies:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

// Get company by ID
router.get('/:id', async (req, res) => {
  try {
    const [company] = await pool.execute('SELECT * FROM companies WHERE id = ?', [req.params.id]);
    if (company.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }
    res.json(company[0]);
  } catch (error) {
    logger.error('Error fetching company:', error);
    res.status(500).json({ error: 'Failed to fetch company' });
  }
});

// Create company
router.post('/', async (req, res) => {
  const { name, cnpj, logo } = req.body;
  
  try {
    if (!name || !cnpj) {
      return res.status(400).json({ error: 'Name and CNPJ are required' });
    }

    const [existingCompany] = await pool.execute('SELECT id FROM companies WHERE cnpj = ?', [cnpj]);
    if (existingCompany.length > 0) {
      return res.status(409).json({ error: 'CNPJ already registered' });
    }

    const [result] = await pool.execute(
      'INSERT INTO companies (name, cnpj, logo) VALUES (?, ?, ?)',
      [name, cnpj, logo]
    );

    res.status(201).json({ 
      id: result.insertId, 
      name, 
      cnpj, 
      logo,
      message: 'Company registered successfully'
    });
  } catch (error) {
    logger.error('Error creating company:', error);
    res.status(500).json({ 
      error: 'Failed to create company',
      details: error.message
    });
  }
});

// Update company
router.put('/:id', async (req, res) => {
  const { name, cnpj, logo } = req.body;
  try {
    if (!name || !cnpj) {
      return res.status(400).json({ error: 'Name and CNPJ are required' });
    }

    const [existingCompany] = await pool.execute(
      'SELECT id FROM companies WHERE cnpj = ? AND id != ?', 
      [cnpj, req.params.id]
    );
    
    if (existingCompany.length > 0) {
      return res.status(409).json({ error: 'CNPJ already registered for another company' });
    }

    await pool.execute(
      'UPDATE companies SET name = ?, cnpj = ?, logo = ? WHERE id = ?',
      [name, cnpj, logo, req.params.id]
    );
    
    res.json({ 
      id: parseInt(req.params.id), 
      name, 
      cnpj, 
      logo,
      message: 'Company updated successfully'
    });
  } catch (error) {
    logger.error('Error updating company:', error);
    res.status(500).json({ error: 'Failed to update company' });
  }
});

// Delete company
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM companies WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting company:', error);
    res.status(500).json({ error: 'Failed to delete company' });
  }
});

export default router;