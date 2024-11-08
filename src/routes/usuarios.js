import express from 'express';
import { supabase } from '../config/supabase.js';
import logger from '../config/logger.js';

const router = express.Router();

router.get('/search', async (req, res) => {
  const { term } = req.query;
  
  if (!term) {
    return res.status(400).json({ error: 'Termo de busca é obrigatório' });
  }

  try {
    const { data: users, error } = await supabase
      .from('users')
      .select(`
        *,
        companies (
          name
        )
      `)
      .or(`cpf.ilike.%${term}%,name.ilike.%${term}%`);

    if (error) throw error;
    
    res.json(users);
  } catch (error) {
    logger.error('Error searching users:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

router.post('/', async (req, res) => {
  const { name, email, cpf, company_id, voucher, turno, is_suspended, photo } = req.body;
  
  try {
    if (!name || !email || !cpf || !company_id || !voucher || !turno) {
      return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos' });
    }

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .or(`email.eq.${email},cpf.eq.${cpf}`)
      .single();

    if (existingUser) {
      return res.status(409).json({ error: 'Já existe um usuário cadastrado com este email ou CPF' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .insert([{
        name,
        email,
        cpf,
        company_id,
        voucher,
        turno,
        is_suspended: is_suspended || false,
        photo
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      id: user.id,
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

router.put('/:cpf', async (req, res) => {
  const { name, email, company_id, voucher, turno, is_suspended, photo } = req.body;
  const { cpf } = req.params;

  try {
    if (!name || !email || !company_id || !voucher || !turno) {
      return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos' });
    }

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .neq('cpf', cpf)
      .single();

    if (existingUser) {
      return res.status(409).json({ error: 'Email já está em uso por outro usuário' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .update({
        name,
        email,
        company_id,
        voucher,
        turno,
        is_suspended: is_suspended || false,
        photo
      })
      .eq('cpf', cpf)
      .select()
      .single();

    if (error) throw error;

    if (!user) {
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