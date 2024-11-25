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
    const { data, error } = await supabase
      .from('background_images')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;

    res.json({ 
      success: true, 
      data: data || [] 
    });

  } catch (error) {
    logger.error('Erro ao buscar imagens:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao buscar imagens de fundo',
      error: error.message 
    });
  }
});

// POST /api/imagens-fundo
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file || !req.body.page) {
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

    if (updateError) throw updateError;

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

    if (insertError) throw insertError;

    res.json({
      success: true,
      message: 'Imagem salva com sucesso',
      data
    });

  } catch (error) {
    logger.error('Erro ao salvar imagem:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao salvar imagem de fundo',
      error: error.message
    });
  }
});

export default router;