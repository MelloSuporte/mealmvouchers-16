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

export default router;