import { supabase } from '../config/supabase.js';
import logger from '../config/logger.js';

export const searchUser = async (req, res) => {
  const { cpf } = req.query;
  
  if (!cpf) {
    return res.status(400).json({ erro: 'CPF é obrigatório para a busca' });
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

    if (error) {
      logger.error('Erro na busca:', error);
      return res.status(500).json({ erro: 'Erro ao buscar usuário', detalhes: error.message });
    }
    
    if (!user) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    const mappedUser = {
      id: user.id,
      nome: user.nome,
      cpf: user.cpf,
      empresa_id: user.empresa_id,
      voucher: user.voucher,
      turno: user.turnos?.tipo_turno,
      horario_inicio: user.turnos?.horario_inicio,
      horario_fim: user.turnos?.horario_fim,
      suspenso: user.suspenso,
      foto: user.foto,
      empresa: user.empresas
    };

    return res.json({ sucesso: true, dados: mappedUser });
  } catch (error) {
    logger.error('Erro ao buscar usuário:', error);
    return res.status(500).json({ erro: 'Erro interno do servidor', mensagem: error.message });
  }
};

export const createUser = async (req, res) => {
  const { nome, cpf, empresa_id, voucher, turno_id, suspenso, foto } = req.body;
  
  if (!nome?.trim() || !cpf?.trim() || !empresa_id || !voucher || !turno_id) {
    return res.status(400).json({ 
      erro: 'Campos obrigatórios faltando',
      detalhes: 'Nome, CPF, empresa, voucher e turno são obrigatórios'
    });
  }

  try {
    const { data: existingUser, error: searchError } = await supabase
      .from('usuarios')
      .select('id, cpf')
      .eq('cpf', cpf)
      .maybeSingle();

    if (searchError) {
      logger.error('Erro na verificação de usuário existente:', searchError);
      return res.status(500).json({ erro: 'Erro ao verificar usuário existente', detalhes: searchError.message });
    }

    if (existingUser) {
      return res.status(409).json({ 
        erro: 'Usuário já existe',
        detalhes: 'Já existe um usuário cadastrado com este CPF'
      });
    }

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

    if (insertError) {
      logger.error('Erro na inserção:', insertError);
      return res.status(500).json({ erro: 'Erro ao criar usuário', detalhes: insertError.message });
    }

    logger.info(`Novo usuário cadastrado - ID: ${newUser.id}, Nome: ${nome}`);
    return res.status(201).json({
      sucesso: true,
      mensagem: 'Usuário cadastrado com sucesso',
      usuario: newUser
    });
  } catch (error) {
    logger.error('Erro ao cadastrar usuário:', error);
    return res.status(500).json({ erro: 'Erro interno do servidor', mensagem: error.message });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { nome, cpf, empresa_id, voucher, turno_id, suspenso, foto } = req.body;

  if (!nome?.trim() || !cpf?.trim() || !empresa_id || !voucher || !turno_id) {
    return res.status(400).json({ 
      erro: 'Campos obrigatórios faltando',
      detalhes: 'Nome, CPF, empresa, voucher e turno são obrigatórios'
    });
  }

  try {
    const { data: existingUser, error: searchError } = await supabase
      .from('usuarios')
      .select('id, cpf')
      .eq('cpf', cpf)
      .neq('id', id)
      .maybeSingle();

    if (searchError) {
      logger.error('Erro na verificação de usuário existente:', searchError);
      return res.status(500).json({ erro: 'Erro ao verificar usuário existente', detalhes: searchError.message });
    }

    if (existingUser) {
      return res.status(409).json({ 
        erro: 'CPF já em uso',
        detalhes: 'Este CPF já está sendo usado por outro usuário'
      });
    }

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

    if (updateError) {
      logger.error('Erro na atualização:', updateError);
      return res.status(500).json({ erro: 'Erro ao atualizar usuário', detalhes: updateError.message });
    }

    if (!updatedUser) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    logger.info(`Usuário atualizado - ID: ${id}, Nome: ${nome}`);
    return res.json({
      sucesso: true,
      mensagem: 'Usuário atualizado com sucesso',
      usuario: updatedUser
    });
  } catch (error) {
    logger.error('Erro ao atualizar usuário:', error);
    return res.status(500).json({ erro: 'Erro interno do servidor', mensagem: error.message });
  }
};