import express from 'express';
import logger from '../config/logger.js';
import pool from '../config/database.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Buscar todas as imagens de fundo
router.get('/', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM background_images WHERE active = true'
    );
    res.json(rows);
  } catch (error) {
    logger.error('Error fetching background images:', error);
    res.status(500).json({ error: 'Erro ao buscar imagens de fundo' });
  } finally {
    if (connection) connection.release();
  }
});

// Salvar novas imagens de fundo
router.post('/', upload.any(), async (req, res) => {
  let connection;
  try {
    const { voucher, userConfirmation, bomApetite } = req.body;
    connection = await pool.getConnection();

    await connection.beginTransaction();

    // Desativa imagens antigas
    await connection.execute(
      'UPDATE background_images SET active = false WHERE page IN ("voucher", "userConfirmation", "bomApetite")'
    );

    // Insere novas imagens
    const images = [
      { page: 'voucher', image: voucher },
      { page: 'userConfirmation', image: userConfirmation },
      { page: 'bomApetite', image: bomApetite }
    ].filter(img => img.image);

    for (const img of images) {
      await connection.execute(
        'INSERT INTO background_images (page, image_url, active) VALUES (?, ?, true)',
        [img.page, img.image]
      );
    }

    await connection.commit();
    res.json({ success: true, message: 'Imagens de fundo atualizadas com sucesso' });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    logger.error('Error saving background images:', error);
    res.status(500).json({ error: 'Erro ao salvar imagens de fundo' });
  } finally {
    if (connection) connection.release();
  }
});

export default router;