import express from 'express';
import pool from '../config/database.js';
import logger from '../config/logger.js';

const router = express.Router();

// Listar empresas
router.get('/', async (req, res) => {
  try {
    const [companies] = await pool.execute('SELECT * FROM companies ORDER BY name');
    res.json(companies);
  } catch (error) {
    logger.error('Erro ao listar empresas:', error);
    res.status(500).json({ error: 'Erro ao buscar empresas' });
  }
});

// Buscar empresa por ID
router.get('/:id', async (req, res) => {
  try {
    const [company] = await pool.execute('SELECT * FROM companies WHERE id = ?', [req.params.id]);
    if (company.length === 0) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }
    res.json(company[0]);
  } catch (error) {
    logger.error('Erro ao buscar empresa:', error);
    res.status(500).json({ error: 'Erro ao buscar empresa' });
  }
});

// Criar empresa
router.post('/', async (req, res) => {
  const { name, cnpj, address } = req.body;
  try {
    const [result] = await pool.execute(
      'INSERT INTO companies (name, cnpj, address) VALUES (?, ?, ?)',
      [name, cnpj, address]
    );
    res.status(201).json({ id: result.insertId, name, cnpj, address });
  } catch (error) {
    logger.error('Erro ao criar empresa:', error);
    res.status(500).json({ error: 'Erro ao criar empresa' });
  }
});

// Atualizar empresa
router.put('/:id', async (req, res) => {
  const { name, cnpj, address } = req.body;
  try {
    await pool.execute(
      'UPDATE companies SET name = ?, cnpj = ?, address = ? WHERE id = ?',
      [name, cnpj, address, req.params.id]
    );
    res.json({ id: req.params.id, name, cnpj, address });
  } catch (error) {
    logger.error('Erro ao atualizar empresa:', error);
    res.status(500).json({ error: 'Erro ao atualizar empresa' });
  }
});

// Deletar empresa
router.delete('/:id', async (req, res) => {
  try {
    await pool.execute('DELETE FROM companies WHERE id = ?', [req.params.id]);
    res.status(204).send();
  } catch (error) {
    logger.error('Erro ao deletar empresa:', error);
    res.status(500).json({ error: 'Erro ao deletar empresa' });
  }
});

export default router;