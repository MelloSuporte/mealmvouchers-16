import express from 'express';
import multer from 'multer';
import { supabase } from '../config/supabase.js';
import logger from '../config/logger.js';

const router = express.Router();

// Configuração do multer para upload de arquivos
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // limite de 5MB
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

    if (error) {
      logger.error('Erro ao buscar imagens:', error);
      throw error;
    }

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
      logger.warn('Requisição inválida - arquivo ou página faltando');
      return res.status(400).json({
        success: false,
        message: 'Arquivo de imagem e página são obrigatórios'
      });
    }

    // Converte a imagem para base64
    const base64Image = req.file.buffer.toString('base64');
    const imageUrl = `data:${req.file.mimetype};base64,${base64Image}`;

    // Desativa imagens anteriores da mesma página
    const { error: updateError } = await supabase
      .from('background_images')
      .update({ is_active: false })
      .eq('page', req.body.page);

    if (updateError) {
      logger.error('Erro ao desativar imagens antigas:', updateError);
      throw updateError;
    }

    // Insere nova imagem
    const { data, error: insertError } = await supabase
      .from('background_images')
      .insert([{
        page: req.body.page,
        image_url: imageUrl,
        is_active: true
      }])
      .select()
      .single();

    if (insertError) {
      logger.error('Erro ao inserir nova imagem:', insertError);
      throw insertError;
    }

    logger.info(`Imagem salva com sucesso para a página ${req.body.page}`);
    return res.json({
      success: true,
      message: 'Imagem salva com sucesso',
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