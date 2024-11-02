import express from 'express';
import logger from '../config/logger.js';

const router = express.Router();

// Search user by CPF
router.get('/search', async (req, res) => {
  const { cpf } = req.query;
  try {
    const [rows] = await req.db.execute(
      'SELECT u.*, c.name as company_name FROM users u LEFT JOIN companies c ON u.company_id = c.id WHERE u.cpf = ?',
      [cpf]
    );
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: 'Usuário não encontrado' });
    }
  } catch (error) {
    logger.error('Error searching user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new user
router.post('/', async (req, res) => {
  const { name, email, cpf, company_id, voucher, turno, is_suspended, photo } = req.body;
  
  try {
    const [result] = await req.db.execute(
      'INSERT INTO users (name, email, cpf, company_id, voucher, turno, is_suspended, photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, email, cpf, company_id, voucher, turno, is_suspended || false, photo]
    );
    
    res.status(201).json({ 
      success: true,
      id: result.insertId,
      message: 'Usuário cadastrado com sucesso'
    });
  } catch (error) {
    logger.error('Error creating user:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;