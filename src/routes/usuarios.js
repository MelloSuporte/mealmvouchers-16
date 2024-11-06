import express from 'express';
import logger from '../config/logger.js';

const router = express.Router();

// Search users
router.get('/search', async (req, res) => {
  const { cpf } = req.query;
  
  if (!cpf) {
    return res.status(400).json({ error: 'CPF é obrigatório para a busca' });
  }

  try {
    const [users] = await req.db.execute(
      `SELECT u.*, e.nome as company_name 
       FROM usuarios u 
       LEFT JOIN empresas e ON u.empresa_id = e.id 
       WHERE u.cpf = ?`,
      [cpf]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.json(users[0]);
  } catch (error) {
    logger.error('Error searching users:', error);
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
});

// Create user
router.post('/', async (req, res) => {
  const { name, email, cpf, company_id, voucher, turno, is_suspended, photo } = req.body;
  
  try {
    if (!name || !email || !cpf || !company_id || !voucher || !turno) {
      return res.status(400).json({ 
        error: 'Todos os campos obrigatórios devem ser preenchidos' 
      });
    }

    // Check if email or CPF already exists
    const [existingUser] = await req.db.execute(
      'SELECT id FROM usuarios WHERE email = ? OR cpf = ?',
      [email, cpf]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({ 
        error: 'Já existe um usuário cadastrado com este email ou CPF' 
      });
    }

    const [result] = await req.db.execute(
      `INSERT INTO usuarios (
        nome, email, cpf, empresa_id, voucher, 
        turno, suspenso, foto
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, cpf, company_id, voucher, turno, is_suspended || false, photo]
    );

    res.status(201).json({
      id: result.insertId,
      message: 'Usuário cadastrado com sucesso'
    });
  } catch (error) {
    logger.error('Error creating user:', error);
    res.status(500).json({ 
      error: 'Erro ao cadastrar usuário',
      details: error.message 
    });
  }
});

// Update user
router.put('/:cpf', async (req, res) => {
  const { name, email, company_id, voucher, turno, is_suspended, photo } = req.body;
  const { cpf } = req.params;

  try {
    if (!name || !email || !company_id || !voucher || !turno) {
      return res.status(400).json({ 
        error: 'Todos os campos obrigatórios devem ser preenchidos' 
      });
    }

    // Check if email already exists for another user
    const [existingUser] = await req.db.execute(
      'SELECT id FROM usuarios WHERE email = ? AND cpf != ?',
      [email, cpf]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({ 
        error: 'Email já está em uso por outro usuário' 
      });
    }

    const [result] = await req.db.execute(
      `UPDATE usuarios SET 
        nome = ?, 
        email = ?, 
        empresa_id = ?, 
        voucher = ?, 
        turno = ?, 
        suspenso = ?,
        foto = ?
       WHERE cpf = ?`,
      [name, email, company_id, voucher, turno, is_suspended || false, photo, cpf]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({ message: 'Usuário atualizado com sucesso' });
  } catch (error) {
    logger.error('Error updating user:', error);
    res.status(500).json({ 
      error: 'Erro ao atualizar usuário',
      details: error.message 
    });
  }
});

export default router;