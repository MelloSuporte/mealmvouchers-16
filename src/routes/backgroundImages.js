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

// GET endpoint for fetching background images
router.get('/background-images', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM imagens_fundo WHERE ativo = true ORDER BY criado_em DESC'
    );
    res.json(rows.map(row => ({
      page: row.pagina,
      image_url: row.url_imagem,
      active: row.ativo,
      created_at: row.criado_em
    })));
  } catch (error) {
    logger.error('Error fetching background images:', error);
    res.status(500).json({ error: 'Erro ao buscar imagens de fundo' });
  } finally {
    if (connection) connection.release();
  }
});

// POST endpoint for saving background images
router.post('/background-images', upload.any(), async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Deactivate existing images
    await connection.execute(
      'UPDATE imagens_fundo SET ativo = false WHERE pagina IN (?, ?, ?)',
      ['voucher', 'userConfirmation', 'bomApetite']
    );

    const files = req.files;
    if (!files || files.length === 0) {
      throw new Error('Nenhum arquivo foi enviado');
    }

    // Save new images
    for (const file of files) {
      const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      await connection.execute(
        'INSERT INTO imagens_fundo (pagina, url_imagem, ativo, criado_em) VALUES (?, ?, true, NOW())',
        [file.fieldname, base64Image]
      );
    }

    await connection.commit();
    res.json({ success: true, message: 'Imagens de fundo atualizadas com sucesso' });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    logger.error('Error saving background images:', error);
    res.status(500).json({ 
      error: 'Erro ao salvar imagens de fundo',
      details: error.message 
    });
  } finally {
    if (connection) connection.release();
  }
});

export default router;