import express from 'express';
import logger from '../config/logger.js';

const router = express.Router();

// Search users by term (name, CPF, or email)
router.get('/search', async (req, res) => {
  const { term } = req.query;
  
  if (!term || term.length < 3) {
    return res.json([]);
  }

  try {
    const [rows] = await req.db.execute(
      `SELECT u.*, c.name as company_name 
       FROM users u 
       LEFT JOIN companies c ON u.company_id = c.id 
       WHERE u.name LIKE ? 
       OR u.cpf LIKE ? 
       OR u.email LIKE ?
       LIMIT 10`,
      [`%${term}%`, `%${term}%`, `%${term}%`]
    );
    
    res.json(rows);
  } catch (error) {
    logger.error('Error searching users:', error);
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