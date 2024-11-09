import express from 'express';
import { supabase } from '../config/supabase.js';
import logger from '../config/logger.js';

const router = express.Router();

// Listar todos os gerentes
router.get('/', async (req, res) => {
  const { cpf } = req.query;
  
  try {
    let query = supabase
      .from('admin_users')
      .select(`
        *,
        empresas (
          id,
          nome
        )
      `)
      .order('nome');
    
    if (cpf) {
      query = query.eq('cpf', cpf);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    logger.error('Error fetching admin users:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários administradores' });
  }
});

// Criar novo gerente
router.post('/', async (req, res) => {
  const { nome, email, cpf, empresa_id, senha, permissoes } = req.body;
  
  try {
    // Validações básicas
    if (!nome?.trim() || !email?.trim() || !cpf?.trim() || !empresa_id || !senha) {
      return res.status(400).json({ 
        error: 'Campos obrigatórios faltando',
        details: 'Nome, email, CPF, empresa e senha são obrigatórios'
      });
    }

    // Verifica se já existe usuário com mesmo CPF ou email
    const { data: existingUser, error: searchError } = await supabase
      .from('admin_users')
      .select('id')
      .or(`cpf.eq.${cpf},email.eq.${email}`)
      .maybeSingle();

    if (searchError) throw searchError;

    if (existingUser) {
      return res.status(409).json({ 
        error: 'Usuário já existe',
        details: 'Já existe um gestor cadastrado com este CPF ou email'
      });
    }

    // Insere novo gerente
    const { data: newAdmin, error: insertError } = await supabase
      .from('admin_users')
      .insert([{
        nome,
        email,
        cpf,
        empresa_id,
        senha,
        permissoes
      }])
      .select()
      .single();

    if (insertError) throw insertError;

    res.status(201).json({
      success: true,
      message: 'Gestor cadastrado com sucesso',
      admin: newAdmin
    });
  } catch (error) {
    logger.error('Error creating admin user:', error);
    res.status(500).json({ 
      error: 'Erro ao cadastrar gestor',
      details: error.message 
    });
  }
});

// Atualizar gerente existente
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, email, empresa_id, senha, permissoes } = req.body;

  try {
    if (!nome?.trim() || !email?.trim() || !empresa_id) {
      return res.status(400).json({ 
        error: 'Campos obrigatórios faltando',
        details: 'Nome, email e empresa são obrigatórios'
      });
    }

    // Verifica se email já está em uso por outro usuário
    const { data: existingUser, error: searchError } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', email)
      .neq('id', id)
      .maybeSingle();

    if (searchError) throw searchError;

    if (existingUser) {
      return res.status(409).json({ 
        error: 'Email já em uso',
        details: 'Este email já está sendo usado por outro gestor'
      });
    }

    // Prepara dados para atualização
    const updateData = {
      nome,
      email,
      empresa_id,
      permissoes,
      updated_at: new Date()
    };

    if (senha) {
      updateData.senha = senha;
    }

    // Atualiza gerente
    const { data: updatedAdmin, error: updateError } = await supabase
      .from('admin_users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    if (!updatedAdmin) {
      return res.status(404).json({ error: 'Gestor não encontrado' });
    }

    res.json({
      success: true,
      message: 'Gestor atualizado com sucesso',
      admin: updatedAdmin
    });
  } catch (error) {
    logger.error('Error updating admin user:', error);
    res.status(500).json({ 
      error: 'Erro ao atualizar gestor',
      details: error.message 
    });
  }
});

export default router;