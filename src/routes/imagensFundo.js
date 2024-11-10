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

// GET /background-images
router.get('/background-images', async (req, res) => {
  try {
    const { data: images, error } = await supabase
      .from('background_images')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    res.json(images);
  } catch (error) {
    logger.error('Error fetching background images:', error);
    res.status(500).json({ error: 'Erro ao buscar imagens de fundo' });
  }
});

// POST /background-images
router.post('/background-images', upload.any(), async (req, res) => {
  try {
    // Deactivate existing images for the pages being updated
    const pagesToUpdate = Object.keys(req.files.reduce((acc, file) => {
      acc[file.fieldname] = true;
      return acc;
    }, {}));

    if (pagesToUpdate.length > 0) {
      const { error: deactivateError } = await supabase
        .from('background_images')
        .update({ is_active: false })
        .in('page', pagesToUpdate);

      if (deactivateError) throw deactivateError;
    }

    // Insert new images
    for (const file of req.files) {
      const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      
      const { error: insertError } = await supabase
        .from('background_images')
        .insert([{
          page: file.fieldname,
          image_url: base64Image,
          is_active: true
        }]);

      if (insertError) throw insertError;
    }

    res.json({ success: true, message: 'Imagens de fundo atualizadas com sucesso' });
  } catch (error) {
    logger.error('Error saving background images:', error);
    res.status(500).json({ error: 'Erro ao salvar imagens de fundo' });
  }
});

export default router;