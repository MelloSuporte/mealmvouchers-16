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

router.get('/', async (req, res) => {
  try {
    logger.info('Buscando imagens de fundo');
    const { data: images, error } = await supabase
      .from('background_images')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Erro ao buscar imagens:', error);
      throw error;
    }
    
    logger.info(`${images?.length || 0} imagens encontradas`);
    res.json(images || []);
  } catch (error) {
    logger.error('Erro ao buscar imagens de fundo:', error);
    res.status(500).json({ error: 'Erro ao buscar imagens de fundo' });
  }
});

router.post('/', upload.any(), async (req, res) => {
  try {
    logger.info('Iniciando upload de imagens');
    logger.info('Arquivos recebidos:', req.files?.length);

    if (!req.files || req.files.length === 0) {
      logger.warn('Nenhum arquivo recebido');
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    // Desativa imagens existentes para as páginas sendo atualizadas
    const pagesToUpdate = Object.keys(req.files.reduce((acc, file) => {
      acc[file.fieldname] = true;
      return acc;
    }, {}));

    logger.info('Páginas para atualizar:', pagesToUpdate);

    if (pagesToUpdate.length > 0) {
      const { error: deactivateError } = await supabase
        .from('background_images')
        .update({ is_active: false })
        .in('page', pagesToUpdate);

      if (deactivateError) {
        logger.error('Erro ao desativar imagens antigas:', deactivateError);
        throw deactivateError;
      }
    }

    // Insere novas imagens
    for (const file of req.files) {
      const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      
      logger.info(`Salvando imagem para página: ${file.fieldname}`);
      
      const { error: insertError } = await supabase
        .from('background_images')
        .insert([{
          page: file.fieldname,
          image_url: base64Image,
          is_active: true
        }]);

      if (insertError) {
        logger.error('Erro ao inserir nova imagem:', insertError);
        throw insertError;
      }
    }

    logger.info('Upload de imagens concluído com sucesso');
    res.json({ success: true, message: 'Imagens de fundo atualizadas com sucesso' });
  } catch (error) {
    logger.error('Erro ao salvar imagens de fundo:', error);
    res.status(500).json({ error: 'Erro ao salvar imagens de fundo' });
  }
});

export default router;