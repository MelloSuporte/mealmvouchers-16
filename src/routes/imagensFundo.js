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
    logger.info('Buscando imagens de fundo');
    
    const { data, error } = await supabase
      .from('background_images')
      .select('*')
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
router.post('/', upload.single('image'), async (req, res) => {
  try {
    logger.info('Iniciando upload de imagem');
    
    if (!req.file || !req.body.page) {
      return res.status(400).json({
        success: false,
        message: 'Arquivo de imagem e página são obrigatórios'
      });
    }

    // Desativa imagem existente para a página específica
    const { error: deactivateError } = await supabase
      .from('background_images')
      .update({ is_active: false })
      .eq('page', req.body.page)
      .eq('is_active', true);

    if (deactivateError) {
      logger.error('Erro ao desativar imagem antiga:', deactivateError);
      throw deactivateError;
    }

    // Converte e insere nova imagem
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    
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

    logger.info(`Upload de imagem para ${req.body.page} concluído com sucesso`);
    
    return res.json({ 
      success: true, 
      message: 'Imagem de fundo atualizada com sucesso',
      data
    });

  } catch (error) {
    logger.error('Erro ao salvar imagem:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Erro ao salvar imagem de fundo',
      error: error.message 
    });
  }
});

export default router;