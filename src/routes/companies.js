import express from 'express';
import { supabase } from '../config/supabase.js';
import logger from '../config/logger.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { data: companies, error } = await supabase
      .from('companies')
      .select('*')
      .order('name');

    if (error) throw error;
    res.json(companies);
  } catch (error) {
    logger.error('Error listing companies:', error);
    res.status(500).json({ error: 'Erro ao buscar empresas' });
  }
});

router.post('/', async (req, res) => {
  const { name, cnpj, logo } = req.body;
  
  try {
    if (!name || !cnpj) {
      return res.status(400).json({ error: 'Nome e CNPJ são obrigatórios' });
    }

    const { data: existingCompany, error: checkError } = await supabase
      .from('companies')
      .select('id')
      .eq('cnpj', cnpj)
      .single();
    
    if (existingCompany) {
      return res.status(409).json({ error: 'CNPJ já cadastrado' });
    }

    const { data: result, error: insertError } = await supabase
      .from('companies')
      .insert([{ name, cnpj, logo }])
      .select()
      .single();

    if (insertError) throw insertError;

    res.status(201).json({ 
      ...result,
      message: 'Empresa cadastrada com sucesso'
    });
  } catch (error) {
    logger.error('Error creating company:', error);
    res.status(500).json({ error: 'Erro ao cadastrar empresa' });
  }
});

router.put('/:id', async (req, res) => {
  const { name, cnpj, logo } = req.body;
  try {
    const { data: existingCompany } = await supabase
      .from('companies')
      .select('id')
      .eq('cnpj', cnpj)
      .neq('id', req.params.id)
      .single();
    
    if (existingCompany) {
      return res.status(409).json({ error: 'CNPJ já cadastrado para outra empresa' });
    }

    const { data: result, error } = await supabase
      .from('companies')
      .update({ name, cnpj, logo })
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    
    if (!result) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }
    
    res.json({ 
      ...result,
      message: 'Empresa atualizada com sucesso'
    });
  } catch (error) {
    logger.error('Error updating company:', error);
    res.status(500).json({ error: 'Erro ao atualizar empresa' });
  }
});

export default router;