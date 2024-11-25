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
        turnos (
          id,
          tipo_turno,
          horario_inicio,
          horario_fim
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
      cpf: user.cpf,
      company_id: user.empresa_id,
      voucher: user.voucher,
      turno: user.turnos?.tipo_turno,
      horario_inicio: user.turnos?.horario_inicio,
      horario_fim: user.turnos?.horario_fim,
      is_suspended: user.suspenso,
      photo: user.foto,
      company: user.empresas
    };

    res.json({ success: true, data: mappedUser });
  } catch (error) {
    logger.error('Erro ao buscar usuário:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar usuário',
      details: error.message
    });
  }
});

// Criar novo usuário
router.post('/', async (req, res) => {
  const { nome, cpf, empresa_id, voucher, turno_id, suspenso, foto } = req.body;
  
  try {
    // Validações básicas
    if (!nome?.trim() || !cpf?.trim() || !empresa_id || !voucher || !turno_id) {
      return res.status(400).json({ 
        error: 'Campos obrigatórios faltando',
        details: 'Nome, CPF, empresa, voucher e turno são obrigatórios'
      });
    }

    // Verifica se já existe usuário com mesmo CPF
    const { data: existingUser, error: searchError } = await supabase
      .from('usuarios')
      .select('id, cpf')
      .eq('cpf', cpf)
      .maybeSingle();

    if (searchError) throw searchError;

    if (existingUser) {
      return res.status(409).json({ 
        error: 'Usuário já existe',
        details: 'Já existe um usuário cadastrado com este CPF'
      });
    }

    // Insere novo usuário
    const { data: newUser, error: insertError } = await supabase
      .from('usuarios')
      .insert([{
        nome,
        cpf,
        empresa_id,
        voucher,
        turno_id,
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
    logger.error('Erro ao cadastrar usuário:', error);
    
    if (error.code === '23505') {
      return res.status(409).json({ 
        error: 'CPF já cadastrado',
        details: 'Este CPF já está sendo usado por outro usuário'
      });
    }
    
    res.status(500).json({ 
      error: 'Erro ao cadastrar usuário',
      details: error.message 
    });
  }
});

// Atualizar usuário existente
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, cpf, empresa_id, voucher, turno_id, suspenso, foto } = req.body;

  try {
    if (!nome?.trim() || !cpf?.trim() || !empresa_id || !voucher || !turno_id) {
      return res.status(400).json({ 
        error: 'Campos obrigatórios faltando',
        details: 'Nome, CPF, empresa, voucher e turno são obrigatórios'
      });
    }

    // Verifica se CPF já está em uso por outro usuário
    const { data: existingUser, error: searchError } = await supabase
      .from('usuarios')
      .select('id, cpf')
      .eq('cpf', cpf)
      .neq('id', id)
      .maybeSingle();

    if (searchError) throw searchError;

    if (existingUser) {
      return res.status(409).json({ 
        error: 'CPF já em uso',
        details: 'Este CPF já está sendo usado por outro usuário'
      });
    }

    // Atualiza usuário
    const { data: updatedUser, error: updateError } = await supabase
      .from('usuarios')
      .update({
        nome,
        cpf,
        empresa_id,
        voucher,
        turno_id,
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
    logger.error('Erro ao atualizar usuário:', error);
    
    if (error.code === '23505') {
      return res.status(409).json({ 
        error: 'CPF já cadastrado',
        details: 'Este CPF já está sendo usado por outro usuário'
      });
    }
    
    res.status(500).json({ 
      error: 'Erro ao atualizar usuário',
      details: error.message 
    });
  }
});

export default router;