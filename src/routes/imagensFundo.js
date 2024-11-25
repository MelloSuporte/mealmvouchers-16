import express from 'express';
import multer from 'multer';
import { supabase } from '../config/supabase.js';
import logger from '../config/logger.js';

const router = express.Router();
const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// GET /imagens-fundo
router.get('/', async (req, res) => {
  try {
    logger.info('Iniciando busca de imagens de fundo');
    
    const { data, error } = await supabase
      .from('background_images')
      .select('*')
      .eq('is_active', true);

    if (error) {
      logger.error('Erro ao buscar imagens:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Erro ao buscar imagens de fundo',
        message: error.message 
      });
    }
    
    logger.info(`${data?.length || 0} imagens encontradas`);
    return res.status(200).json({ 
      success: true, 
      data: data || [] 
    });
  } catch (error) {
    logger.error('Erro não esperado ao buscar imagens:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Erro interno ao buscar imagens',
      message: error.message 
    });
  }
});

// POST /imagens-fundo
router.post('/', upload.any(), async (req, res) => {
  try {
    logger.info('Iniciando upload de imagens');
    
    if (!req.files?.length) {
      logger.warn('Nenhum arquivo recebido');
      return res.status(400).json({ 
        success: false, 
        error: 'Nenhum arquivo enviado' 
      });
    }

    // Desativa imagens existentes
    const pagesToUpdate = req.files.map(file => file.fieldname);
    
    logger.info('Desativando imagens antigas para páginas:', pagesToUpdate);
    
    const { error: deactivateError } = await supabase
      .from('background_images')
      .update({ is_active: false })
      .in('page', pagesToUpdate);

    if (deactivateError) {
      logger.error('Erro ao desativar imagens antigas:', deactivateError);
      return res.status(500).json({
        success: false,
        error: 'Erro ao desativar imagens antigas',
        message: deactivateError.message
      });
    }

    // Converte e insere novas imagens
    const insertPromises = req.files.map(async (file) => {
      const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      
      return supabase
        .from('background_images')
        .insert([{
          page: file.fieldname,
          image_url: base64Image,
          is_active: true,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
    });

    const results = await Promise.all(insertPromises);
    const errors = results.filter(result => result.error);

    if (errors.length > 0) {
      logger.error('Erros ao inserir novas imagens:', errors);
      return res.status(500).json({
        success: false,
        error: 'Erro ao inserir novas imagens',
        message: errors[0].error.message
      });
    }

    logger.info('Upload de imagens concluído com sucesso');
    return res.status(200).json({ 
      success: true, 
      message: 'Imagens de fundo atualizadas com sucesso',
      updatedPages: pagesToUpdate
    });
  } catch (error) {
    logger.error('Erro não esperado ao salvar imagens:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Erro ao salvar imagens de fundo',
      message: error.message
    });
  }
});

export default router;