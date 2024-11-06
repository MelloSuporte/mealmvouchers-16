import express from 'express';
import logger from '../config/logger.js';
import { validateCNPJ } from '../utils/validations.js';

const router = express.Router();

// List companies
router.get('/', async (req, res) => {
  let connection;
  try {
    connection = await req.db.getConnection();
    const [companies] = await connection.execute(
      'SELECT * FROM companies ORDER BY name'
    );
    res.json(companies);
  } catch (error) {
    logger.error('Error fetching companies:', error);
    res.status(500).json({ 
      error: 'Database error',
      message: 'Error fetching companies'
    });
  } finally {
    if (connection) connection.release();
  }
});

// Create company
router.post('/', async (req, res) => {
  const { name, cnpj, logo } = req.body;
  let connection;
  
  try {
    // Validations
    if (!name?.trim()) {
      return res.status(400).json({ error: 'Nome da empresa é obrigatório' });
    }
    if (name.length < 3) {
      return res.status(400).json({ error: 'Nome da empresa deve ter no mínimo 3 caracteres' });
    }
    if (!cnpj) {
      return res.status(400).json({ error: 'CNPJ é obrigatório' });
    }
    
    validateCNPJ(cnpj);
    
    connection = await req.db.getConnection();
    await connection.beginTransaction();
    
    // Check if company already exists
    const [existing] = await connection.execute(
      'SELECT id FROM companies WHERE cnpj = ?',
      [cnpj]
    );
    
    if (existing.length > 0) {
      await connection.rollback();
      return res.status(409).json({ error: 'CNPJ já cadastrado' });
    }
    
    // Insert new company
    const [result] = await connection.execute(
      'INSERT INTO companies (name, cnpj, logo) VALUES (?, ?, ?)',
      [name, cnpj, logo]
    );
    
    await connection.commit();
    logger.info(`Nova empresa cadastrada - ID: ${result.insertId}, Nome: ${name}`);
    
    res.status(201).json({ 
      id: result.insertId, 
      name, 
      cnpj, 
      logo,
      success: true,
      message: 'Empresa cadastrada com sucesso'
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    logger.error('Error creating company:', error);
    res.status(400).json({ 
      error: error.message || 'Erro ao cadastrar empresa',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    if (connection) connection.release();
  }
});

// Update company
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, cnpj, logo } = req.body;
  let connection;
  
  try {
    // Validations
    if (!name?.trim()) {
      return res.status(400).json({ error: 'Nome da empresa é obrigatório' });
    }
    if (name.length < 3) {
      return res.status(400).json({ error: 'Nome da empresa deve ter no mínimo 3 caracteres' });
    }
    if (!cnpj) {
      return res.status(400).json({ error: 'CNPJ é obrigatório' });
    }
    
    validateCNPJ(cnpj);
    
    connection = await req.db.getConnection();
    await connection.beginTransaction();
    
    // Check if another company has this CNPJ
    const [existing] = await connection.execute(
      'SELECT id FROM companies WHERE cnpj = ? AND id != ?',
      [cnpj, id]
    );
    
    if (existing.length > 0) {
      await connection.rollback();
      return res.status(409).json({ error: 'CNPJ já cadastrado para outra empresa' });
    }
    
    // Update company
    const [result] = await connection.execute(
      'UPDATE companies SET name = ?, cnpj = ?, logo = ? WHERE id = ?',
      [name, cnpj, logo, id]
    );
    
    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }
    
    await connection.commit();
    logger.info(`Empresa atualizada - ID: ${id}, Nome: ${name}`);
    
    res.json({ 
      id: parseInt(id), 
      name, 
      cnpj, 
      logo,
      success: true,
      message: 'Empresa atualizada com sucesso'
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    logger.error('Error updating company:', error);
    res.status(400).json({ 
      error: error.message || 'Erro ao atualizar empresa',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    if (connection) connection.release();
  }
});

export default router;