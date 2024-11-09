import express from 'express';
import { supabase } from '../config/supabase.js';
import logger from '../config/logger.js';
import multer from 'multer';

const router = express.Router();
const upload = multer();

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
router.post('/', upload.single('logo'), async (req, res) => {
  try {
    const { nome, cnpj } = req.body;
    
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

    let logoUrl = null;
    if (req.file) {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('logos')
        .upload(`company-logos/${Date.now()}-${req.file.originalname}`, req.file.buffer);

      if (uploadError) {
        logger.error('Erro ao fazer upload da logo:', uploadError);
        throw uploadError;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(uploadData.path);
        
      logoUrl = publicUrl;
    }

    // Insere nova empresa
    const { data: newCompany, error: insertError } = await supabase
      .from('empresas')
      .insert([{
        nome: nome.trim(),
        cnpj: cnpjLimpo,
        logo: logoUrl
      }])
      .select()
      .single();

    if (insertError) {
      logger.error('Erro ao inserir empresa:', insertError);
      throw insertError;
    }

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
router.put('/:id', upload.single('logo'), async (req, res) => {
  const { id } = req.params;
  const { nome, cnpj } = req.body;
  
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

    let logoUrl = null;
    if (req.file) {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('logos')
        .upload(`company-logos/${Date.now()}-${req.file.originalname}`, req.file.buffer);

      if (uploadError) {
        logger.error('Erro ao fazer upload da logo:', uploadError);
        throw uploadError;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(uploadData.path);
        
      logoUrl = publicUrl;
    }

    const updateData = {
      nome: nome.trim(),
      cnpj: cnpjLimpo
    };

    if (logoUrl) {
      updateData.logo = logoUrl;
    }

    // Atualiza empresa
    const { data: updatedCompany, error: updateError } = await supabase
      .from('empresas')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      logger.error('Erro ao atualizar empresa:', updateError);
      throw updateError;
    }

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