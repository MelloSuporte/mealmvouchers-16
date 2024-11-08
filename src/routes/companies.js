import express from 'express';
import { supabase } from '../config/supabase.js';
import logger from '../config/logger.js';

const router = express.Router();

router.get('/empresas', async (req, res) => {
  try {
    const { data: companies, error } = await supabase
      .from('empresas')
      .select('*')
      .order('nome');

    if (error) {
      logger.error('Error fetching companies:', error);
      throw error;
    }
    
    res.json(companies || []);
  } catch (error) {
    logger.error('Error listing companies:', error);
    res.status(500).json({ error: 'Erro ao buscar empresas' });
  }
});

router.post('/empresas', async (req, res) => {
  const { nome, cnpj, logo } = req.body;
  
  try {
    if (!nome || !cnpj) {
      return res.status(400).json({ error: 'Nome e CNPJ são obrigatórios' });
    }

    const { data: existingCompany } = await supabase
      .from('empresas')
      .select('id')
      .eq('cnpj', cnpj)
      .single();
    
    if (existingCompany) {
      return res.status(409).json({ error: 'CNPJ já cadastrado' });
    }

    const { data: company, error } = await supabase
      .from('empresas')
      .insert([{ nome, cnpj: cnpj.replace(/[^\d]/g, ''), logo }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(company);
  } catch (error) {
    logger.error('Error creating company:', error);
    res.status(500).json({ error: 'Erro ao cadastrar empresa' });
  }
});

router.put('/empresas/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, cnpj, logo } = req.body;

  try {
    const { data: existingCompany } = await supabase
      .from('empresas')
      .select('id')
      .eq('cnpj', cnpj)
      .neq('id', id)
      .single();
    
    if (existingCompany) {
      return res.status(409).json({ error: 'CNPJ já cadastrado para outra empresa' });
    }

    const { data: company, error } = await supabase
      .from('empresas')
      .update({ nome, cnpj: cnpj.replace(/[^\d]/g, ''), logo })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    if (!company) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }

    res.json(company);
  } catch (error) {
    logger.error('Error updating company:', error);
    res.status(500).json({ error: 'Erro ao atualizar empresa' });
  }
});

export default router;