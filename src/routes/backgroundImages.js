import express from 'express';
import multer from 'multer';
import logger from '../config/logger.js';

const router = express.Router();
const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Get all background images
router.get('/', async (req, res) => {
  try {
    const [rows] = await req.db.execute(
      'SELECT * FROM imagens_fundo WHERE ativo = true ORDER BY criado_em DESC'
    );
    res.json(rows);
  } catch (error) {
    logger.error('Error fetching background images:', error);
    res.status(500).json({ error: 'Erro ao buscar imagens de fundo' });
  }
});

// Save background images
router.post('/', upload.any(), async (req, res) => {
  const connection = req.db;
  try {
    await connection.beginTransaction();

    // Deactivate existing images for the pages being updated
    const pagesToUpdate = Object.keys(req.files.reduce((acc, file) => {
      acc[file.fieldname] = true;
      return acc;
    }, {}));

    if (pagesToUpdate.length > 0) {
      await connection.execute(
        'UPDATE imagens_fundo SET ativo = false WHERE pagina IN (?)',
        [pagesToUpdate]
      );
    }

    // Insert new images
    for (const file of req.files) {
      const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      await connection.execute(
        'INSERT INTO imagens_fundo (pagina, url_imagem, ativo, criado_em) VALUES (?, ?, true, NOW())',
        [file.fieldname, base64Image]
      );
    }

    await connection.commit();
    res.json({ success: true, message: 'Imagens de fundo atualizadas com sucesso' });
  } catch (error) {
    await connection.rollback();
    logger.error('Error saving background images:', error);
    res.status(500).json({ error: 'Erro ao salvar imagens de fundo' });
  }
});

export default router;