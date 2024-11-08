import express from 'express';
import { supabase } from '../config/supabase.js';
import logger from '../config/logger.js';

const router = express.Router();

// Busca usuário por CPF
router.get('/search', async (req, res) => {
  const { cpf } = req.query;
  
  if (!cpf) {
    return res.status(400).json({ error: 'CPF é obrigatório para a busca' });
  }

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        *,
        companies (
          id,
          name
        )
      `)
      .eq('cpf', cpf)
      .maybeSingle();

    if (error) throw error;
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(user);
  } catch (error) {
    logger.error('Error searching user:', error);
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
});

// Criar novo usuário
router.post('/', async (req, res) => {
  const { name, email, cpf, company_id, voucher, turno, is_suspended, photo } = req.body;
  
  try {
    // Validações
    if (!name?.trim() || !email?.trim() || !cpf?.trim() || !company_id || !voucher || !turno) {
      return res.status(400).json({ 
        error: 'Campos obrigatórios faltando',
        details: 'Nome, email, CPF, empresa, voucher e turno são obrigatórios'
      });
    }

    // Verifica se já existe usuário com mesmo CPF ou email
    const { data: existingUser, error: searchError } = await supabase
      .from('users')
      .select('id, cpf, email')
      .or(`cpf.eq.${cpf},email.eq.${email}`)
      .maybeSingle();

    if (searchError) throw searchError;

    if (existingUser) {
      return res.status(409).json({ 
        error: 'Usuário já existe',
        details: 'Já existe um usuário cadastrado com este CPF ou email'
      });
    }

    // Insere novo usuário
    const { data: newUser, error: insertError } = await supabase
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

    if (insertError) throw insertError;

    logger.info(`Novo usuário cadastrado - ID: ${newUser.id}, Nome: ${name}`);
    res.status(201).json({
      success: true,
      message: 'Usuário cadastrado com sucesso',
      user: newUser
    });
  } catch (error) {
    logger.error('Error creating user:', error);
    res.status(500).json({ 
      error: 'Erro ao cadastrar usuário',
      details: error.message 
    });
  }
});

// Atualizar usuário existente
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, company_id, voucher, turno, is_suspended, photo } = req.body;

  try {
    if (!name?.trim() || !email?.trim() || !company_id || !voucher || !turno) {
      return res.status(400).json({ 
        error: 'Campos obrigatórios faltando',
        details: 'Nome, email, empresa, voucher e turno são obrigatórios'
      });
    }

    // Verifica se email já está em uso por outro usuário
    const { data: existingUser, error: searchError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email)
      .neq('id', id)
      .maybeSingle();

    if (searchError) throw searchError;

    if (existingUser) {
      return res.status(409).json({ 
        error: 'Email já em uso',
        details: 'Este email já está sendo usado por outro usuário'
      });
    }

    // Atualiza usuário
    const { data: updatedUser, error: updateError } = await supabase
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
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    if (!updatedUser) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    logger.info(`Usuário atualizado - ID: ${id}, Nome: ${name}`);
    res.json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      user: updatedUser
    });
  } catch (error) {
    logger.error('Error updating user:', error);
    res.status(500).json({ 
      error: 'Erro ao atualizar usuário',
      details: error.message 
    });
  }
});

export default router;