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
    
    const { data: images, error } = await supabase
      .from('background_images')
      .select('*')
      .eq('is_active', true);

    if (error) {
      logger.error('Erro ao buscar imagens:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Erro ao buscar imagens de fundo',
        details: error.message 
      });
    }
    
    logger.info(`${images?.length || 0} imagens encontradas`);
    res.json({ success: true, data: images || [] });
  } catch (error) {
    logger.error('Erro não esperado ao buscar imagens:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno ao buscar imagens',
      details: error.message 
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
      throw deactivateError;
    }

    // Converte e insere novas imagens
    const insertPromises = req.files.map(async (file) => {
      // Converte o buffer da imagem para base64
      const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      
      const { error: insertError } = await supabase
        .from('background_images')
        .insert([{
          page: file.fieldname,
          image_url: base64Image,
          is_active: true,
          created_at: new Date().toISOString()
        }]);

      if (insertError) {
        throw insertError;
      }
    });

    await Promise.all(insertPromises);

    logger.info('Upload de imagens concluído com sucesso');
    res.json({ 
      success: true, 
      message: 'Imagens de fundo atualizadas com sucesso',
      updatedPages: pagesToUpdate
    });
  } catch (error) {
    logger.error('Erro não esperado ao salvar imagens:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Erro ao salvar imagens de fundo',
      details: error.details || error.message
    });
  }
});

export default router;