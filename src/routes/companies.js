import express from 'express';
import { supabase } from '../config/supabase.js';
import logger from '../config/logger.js';

const router = express.Router();

// Listar empresas
router.get('/', async (req, res) => {
  try {
    logger.info('Iniciando busca de empresas');
    const { data: companies, error } = await supabase
      .from('empresas')
      .select('*')
      .order('nome');

    if (error) {
      logger.error('Erro ao buscar empresas:', error);
      return res.status(500).json({ 
        error: 'Erro ao buscar empresas',
        details: error.message 
      });
    }

    logger.info(`${companies?.length || 0} empresas encontradas`);
    res.json(companies || []);
  } catch (error) {
    logger.error('Erro ao buscar empresas:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar empresas',
      details: error.message 
    });
  }
});

// Criar empresa
router.post('/', async (req, res) => {
  const { nome, cnpj, logo } = req.body;
  
  try {
    logger.info('Iniciando cadastro de empresa:', { nome, cnpj });

    if (!nome?.trim()) {
      return res.status(400).json({ error: 'Nome da empresa é obrigatório' });
    }
    if (!cnpj?.trim()) {
      return res.status(400).json({ error: 'CNPJ é obrigatório' });
    }

    const cnpjLimpo = cnpj.replace(/[^\d]/g, '');

    // Verifica CNPJ duplicado
    const { data: existingCompany, error: checkError } = await supabase
      .from('empresas')
      .select('id')
      .eq('cnpj', cnpjLimpo)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      logger.error('Erro ao verificar CNPJ duplicado:', checkError);
      return res.status(500).json({ 
        error: 'Erro ao verificar CNPJ',
        details: checkError.message 
      });
    }

    if (existingCompany) {
      return res.status(409).json({ error: 'CNPJ já cadastrado' });
    }

    // Insere nova empresa
    const { data: newCompany, error: insertError } = await supabase
      .from('empresas')
      .insert([{
        nome: nome.trim(),
        cnpj: cnpjLimpo,
        logo
      }])
      .select()
      .single();

    if (insertError) {
      logger.error('Erro ao inserir empresa:', insertError);
      return res.status(500).json({ 
        error: 'Erro ao cadastrar empresa',
        details: insertError.message 
      });
    }

    logger.info('Empresa cadastrada com sucesso:', newCompany);
    res.status(201).json(newCompany);
  } catch (error) {
    logger.error('Erro ao cadastrar empresa:', error);
    res.status(500).json({ 
      error: 'Erro ao cadastrar empresa',
      details: error.message 
    });
  }
});

// Atualizar empresa
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, cnpj, logo } = req.body;
  
  try {
    logger.info('Iniciando atualização de empresa:', { id, nome, cnpj });

    const cnpjLimpo = cnpj.replace(/[^\d]/g, '');

    // Verifica CNPJ duplicado
    const { data: existingCompany, error: checkError } = await supabase
      .from('empresas')
      .select('id')
      .eq('cnpj', cnpjLimpo)
      .neq('id', id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      logger.error('Erro ao verificar CNPJ duplicado:', checkError);
      return res.status(500).json({ 
        error: 'Erro ao verificar CNPJ',
        details: checkError.message 
      });
    }

    if (existingCompany) {
      return res.status(409).json({ error: 'CNPJ já cadastrado para outra empresa' });
    }

    // Atualiza empresa
    const { data: updatedCompany, error: updateError } = await supabase
      .from('empresas')
      .update({ 
        nome: nome.trim(), 
        cnpj: cnpjLimpo,
        logo 
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      logger.error('Erro ao atualizar empresa:', updateError);
      return res.status(500).json({ 
        error: 'Erro ao atualizar empresa',
        details: updateError.message 
      });
    }

    if (!updatedCompany) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }

    logger.info('Empresa atualizada com sucesso:', updatedCompany);
    res.json(updatedCompany);
  } catch (error) {
    logger.error('Erro ao atualizar empresa:', error);
    res.status(500).json({ 
      error: 'Erro ao atualizar empresa',
      details: error.message 
    });
  }
});

export default router;