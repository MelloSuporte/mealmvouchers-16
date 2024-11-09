import express from 'express';
import multer from 'multer';
import logger from '../config/logger.js';
import { checkDuplicateCNPJ, createCompany, updateCompany } from '../services/companyService.js';
import { supabase } from '../config/supabase.js';

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

    const existingCompany = await checkDuplicateCNPJ(cnpj);
    if (existingCompany) {
      return res.status(409).json({ error: 'CNPJ já cadastrado' });
    }

    const newCompany = await createCompany(
      nome,
      cnpj,
      req.file?.buffer,
      req.file?.originalname
    );

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
  try {
    const { id } = req.params;
    const { nome, cnpj } = req.body;
    
    if (!nome?.trim()) {
      return res.status(400).json({ error: 'Nome da empresa é obrigatório' });
    }
    if (!cnpj?.trim()) {
      return res.status(400).json({ error: 'CNPJ é obrigatório' });
    }

    const existingCompany = await checkDuplicateCNPJ(cnpj, id);
    if (existingCompany) {
      return res.status(409).json({ error: 'CNPJ já cadastrado para outra empresa' });
    }

    const updatedCompany = await updateCompany(
      id,
      nome,
      cnpj,
      req.file?.buffer,
      req.file?.originalname
    );

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