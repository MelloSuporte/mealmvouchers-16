import express from 'express';
import { supabase } from '../config/supabase.js';
import logger from '../config/logger.js';

const router = express.Router();

// Listar empresas
router.get('/', async (req, res) => {
  try {
    const { data: empresas, error } = await supabase
      .from('empresas')
      .select('*')
      .order('nome');

    if (error) throw error;

    res.json(empresas || []);
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
    if (!nome?.trim()) {
      return res.status(400).json({ error: 'Nome da empresa é obrigatório' });
    }
    if (!cnpj?.trim()) {
      return res.status(400).json({ error: 'CNPJ é obrigatório' });
    }

    const cnpjLimpo = cnpj.replace(/[^\d]/g, '');

    // Verifica CNPJ duplicado
    const { data: existingCompany } = await supabase
      .from('empresas')
      .select('id')
      .eq('cnpj', cnpjLimpo)
      .single();

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

    if (insertError) throw insertError;

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
    if (!nome?.trim()) {
      return res.status(400).json({ error: 'Nome da empresa é obrigatório' });
    }
    if (!cnpj?.trim()) {
      return res.status(400).json({ error: 'CNPJ é obrigatório' });
    }

    const cnpjLimpo = cnpj.replace(/[^\d]/g, '');

    // Verifica CNPJ duplicado
    const { data: existingCompany } = await supabase
      .from('empresas')
      .select('id')
      .eq('cnpj', cnpjLimpo)
      .neq('id', id)
      .single();

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

    if (updateError) throw updateError;

    if (!updatedCompany) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }

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