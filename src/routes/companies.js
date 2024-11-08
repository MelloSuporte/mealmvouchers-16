import express from 'express';
import { supabase } from '../config/supabase.js';
import logger from '../config/logger.js';

const router = express.Router();

// Listar empresas
router.get('/', async (req, res) => {
  try {
    const { data: companies, error } = await supabase
      .from('empresas')
      .select('*')
      .order('nome');

    if (error) throw error;
    res.json(companies);
  } catch (error) {
    logger.error('Error fetching companies:', error);
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
    // Validações
    if (!nome?.trim()) {
      return res.status(400).json({ error: 'Nome da empresa é obrigatório' });
    }
    if (!cnpj?.trim()) {
      return res.status(400).json({ error: 'CNPJ é obrigatório' });
    }

    // Verifica CNPJ duplicado
    const { data: existingCompany } = await supabase
      .from('empresas')
      .select('id')
      .eq('cnpj', cnpj.replace(/[^\d]/g, ''))
      .single();

    if (existingCompany) {
      return res.status(409).json({ error: 'CNPJ já cadastrado' });
    }

    // Insere nova empresa
    const { data: company, error: insertError } = await supabase
      .from('empresas')
      .insert([{
        nome,
        cnpj: cnpj.replace(/[^\d]/g, ''),
        logo
      }])
      .select()
      .single();

    if (insertError) throw insertError;

    res.status(201).json(company);
  } catch (error) {
    logger.error('Error creating company:', error);
    res.status(500).json({ 
      error: 'Erro ao criar empresa',
      details: error.message 
    });
  }
});

// Atualizar empresa
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, cnpj, logo } = req.body;
  
  try {
    // Verifica CNPJ duplicado
    const { data: existingCompany } = await supabase
      .from('empresas')
      .select('id')
      .eq('cnpj', cnpj.replace(/[^\d]/g, ''))
      .neq('id', id)
      .single();

    if (existingCompany) {
      return res.status(409).json({ error: 'CNPJ já cadastrado para outra empresa' });
    }

    // Atualiza empresa
    const { data: company, error: updateError } = await supabase
      .from('empresas')
      .update({ 
        nome, 
        cnpj: cnpj.replace(/[^\d]/g, ''), 
        logo 
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;
    
    if (!company) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }

    res.json(company);
  } catch (error) {
    logger.error('Error updating company:', error);
    res.status(500).json({ 
      error: 'Erro ao atualizar empresa',
      details: error.message 
    });
  }
});

export default router;