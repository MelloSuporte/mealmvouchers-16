import express from 'express';
import pool from '../config/database.js';
import logger from '../config/logger.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { userId, companyId, dates } = req.body;
  let db;

  try {
    db = await pool.getConnection();
    
    for (const date of dates) {
      await db.execute(
        'INSERT INTO extra_vouchers (user_id, authorized_by, valid_until) VALUES (?, ?, ?)',
        [userId, 1, date] // authorized_by hardcoded como 1 por enquanto
      );
    }

    res.status(201).json({ 
      success: true,
      message: 'Vouchers extras criados com sucesso'
    });
  } catch (error) {
    logger.error('Error creating extra vouchers:', error);
    res.status(500).json({ error: error.message });
  } finally {
    if (db) db.release();
  }
});

export default router;