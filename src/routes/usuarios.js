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
      .from('usuarios')
      .select(`
        *,
        empresas (
          id,
          nome
        ),
        turnos!inner (
          tipo_turno
        )
      `)
      .eq('cpf', cpf)
      .maybeSingle();

    if (error) throw error;
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const mappedUser = {
      id: user.id,
      name: user.nome,
      email: user.email,
      cpf: user.cpf,
      company_id: user.empresa_id,
      voucher: user.voucher,
      tipos_turno: user.turnos?.tipo_turno,
      is_suspended: user.suspenso,
      photo: user.foto,
      company: user.empresas
    };

    res.json(mappedUser);
  } catch (error) {
    logger.error('Error searching user:', error);
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
});

// Criar novo usuário
router.post('/', async (req, res) => {
  const { nome, email, cpf, empresa_id, voucher, tipos_turno, suspenso, foto } = req.body;
  
  try {
    // Validações
    if (!nome?.trim() || !email?.trim() || !cpf?.trim() || !empresa_id || !voucher || !tipos_turno) {
      return res.status(400).json({ 
        error: 'Campos obrigatórios faltando',
        details: 'Nome, email, CPF, empresa, voucher e turno são obrigatórios'
      });
    }

    // Verifica se já existe usuário com mesmo CPF ou email
    const { data: existingUser, error: searchError } = await supabase
      .from('usuarios')
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
      .from('usuarios')
      .insert([{
        nome,
        email,
        cpf,
        empresa_id,
        voucher,
        tipos_turno,
        suspenso: suspenso || false,
        foto
      }])
      .select()
      .single();

    if (insertError) throw insertError;

    logger.info(`Novo usuário cadastrado - ID: ${newUser.id}, Nome: ${nome}`);
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
  const { nome, email, empresa_id, voucher, tipos_turno, suspenso, foto } = req.body;

  try {
    if (!nome?.trim() || !email?.trim() || !empresa_id || !voucher || !tipos_turno) {
      return res.status(400).json({ 
        error: 'Campos obrigatórios faltando',
        details: 'Nome, email, empresa, voucher e turno são obrigatórios'
      });
    }

    // Verifica se email já está em uso por outro usuário
    const { data: existingUser, error: searchError } = await supabase
      .from('usuarios')
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
      .from('usuarios')
      .update({
        nome,
        email,
        empresa_id,
        voucher,
        tipos_turno,
        suspenso: suspenso || false,
        foto
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    if (!updatedUser) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    logger.info(`Usuário atualizado - ID: ${id}, Nome: ${nome}`);
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