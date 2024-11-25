import express from 'express';
import multer from 'multer';
import { supabase } from '../config/supabase.js';
import logger from '../config/logger.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// GET /api/imagens-fundo
router.get('/', async (req, res) => {
  try {
    logger.info('Iniciando busca de imagens de fundo');
    
    const { data, error } = await supabase
      .from('background_images')
      .select('*')
      .order('created_at', { ascending: false })
      .eq('is_active', true);

    if (error) throw error;

    logger.info(`${data?.length || 0} imagens encontradas`);
    return res.json({ 
      success: true, 
      data: data || [] 
    });

  } catch (error) {
    logger.error('Erro ao buscar imagens:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Erro ao buscar imagens de fundo',
      error: error.message 
    });
  }
});

// POST /api/imagens-fundo
router.post('/', upload.array('image'), async (req, res) => {
  try {
    logger.info('Iniciando upload de imagens');
    
    if (!req.files?.length) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nenhum arquivo enviado' 
      });
    }

    // Desativa imagens existentes
    const { error: deactivateError } = await supabase
      .from('background_images')
      .update({ is_active: false })
      .eq('is_active', true);

    if (deactivateError) throw deactivateError;

    // Converte e insere novas imagens
    const insertResults = [];
    
    for (const file of req.files) {
      const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      
      const { data, error: insertError } = await supabase
        .from('background_images')
        .insert({
          page: req.body.page,
          image_url: base64Image,
          is_active: true,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        logger.error(`Erro ao inserir imagem para ${req.body.page}:`, insertError);
        throw insertError;
      }
      
      insertResults.push(data);
    }

    logger.info('Upload de imagens concluído com sucesso');
    
    return res.json({ 
      success: true, 
      message: 'Imagens de fundo atualizadas com sucesso',
      data: insertResults
    });

  } catch (error) {
    logger.error('Erro ao salvar imagens:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Erro ao salvar imagens de fundo',
      error: error.message 
    });
  }
});

export default router;