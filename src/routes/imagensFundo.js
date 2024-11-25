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

    if (error) throw error;

    logger.info(`${data?.length || 0} imagens encontradas`);
    return res.status(200).json({ 
      success: true, 
      data: data || [] 
    });
  } catch (error) {
    logger.error('Erro ao buscar imagens:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Erro ao buscar imagens de fundo',
      message: error.message 
    });
  }
});

// POST /imagens-fundo
router.post('/', upload.any(), async (req, res) => {
  try {
    logger.info('Iniciando upload de imagens');
    
    if (!req.files?.length) {
      return res.status(400).json({ 
        success: false, 
        error: 'Nenhum arquivo enviado' 
      });
    }

    // Desativa imagens existentes
    const pagesToUpdate = req.files.map(file => file.fieldname);
    
    const { error: deactivateError } = await supabase
      .from('background_images')
      .update({ is_active: false })
      .in('page', pagesToUpdate);

    if (deactivateError) throw deactivateError;

    // Converte e insere novas imagens
    const insertPromises = req.files.map(async (file) => {
      const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      
      const { data, error } = await supabase
        .from('background_images')
        .insert([{
          page: file.fieldname,
          image_url: base64Image,
          is_active: true,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return { data, page: file.fieldname };
    });

    const results = await Promise.all(insertPromises);

    logger.info('Upload de imagens concluído com sucesso');
    return res.status(200).json({ 
      success: true, 
      message: 'Imagens de fundo atualizadas com sucesso',
      data: results.map(result => ({
        page: result.page,
        id: result.data?.id
      }))
    });
  } catch (error) {
    logger.error('Erro ao salvar imagens:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Erro ao salvar imagens de fundo',
      message: error.message
    });
  }
});

export default router;