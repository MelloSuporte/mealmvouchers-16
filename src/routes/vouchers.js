import express from 'express';
import { validateVoucher, validateDisposableVoucher } from '../controllers/voucherController';
import logger from '../config/logger.js';
import pool from '../config/database.js';

const router = express.Router();

// Middleware para logging de requisições
router.use((req, res, next) => {
  logger.info(`Voucher validation attempt - CPF: ${req.body.cpf}, Type: ${req.body.mealType}`);
  next();
});

router.post('/validate', async (req, res) => {
  try {
    await validateVoucher(req, res);
  } catch (error) {
    logger.error('Voucher validation error:', error);
    res.status(500).json({ 
      error: 'Erro ao validar voucher. Por favor, tente novamente.',
      userName: null,
      turno: null
    });
  }
});

router.post('/validate-disposable', async (req, res) => {
  try {
    await validateDisposableVoucher(req, res);
  } catch (error) {
    logger.error('Disposable voucher validation error:', error);
    res.status(500).json({ error: 'Erro ao validar voucher descartável.' });
  }
});

// Novo endpoint para verificar se o código já existe
router.post('/check', async (req, res) => {
  const { code } = req.body;
  let db;

  try {
    db = await pool.getConnection();
    const [rows] = await db.execute(
      'SELECT EXISTS(SELECT 1 FROM disposable_vouchers WHERE code = ?) as exists',
      [code]
    );
    res.json({ exists: rows[0].exists === 1 });
  } catch (error) {
    logger.error('Error checking voucher code:', error);
    res.status(500).json({ error: 'Erro ao verificar código do voucher' });
  } finally {
    if (db) db.release();
  }
});

// Novo endpoint para criar voucher descartável
router.post('/create', async (req, res) => {
  const { code, meal_type_id, created_by } = req.body;
  let db;

  try {
    db = await pool.getConnection();
    
    // Inserir o novo voucher
    const [result] = await db.execute(
      `INSERT INTO disposable_vouchers 
       (code, meal_type_id, created_by, expired_at) 
       VALUES (?, ?, ?, DATE_ADD(CURRENT_DATE(), INTERVAL 1 DAY))`,
      [code, meal_type_id, created_by]
    );

    // Buscar o voucher criado com o nome do tipo de refeição
    const [voucher] = await db.execute(
      `SELECT dv.*, mt.name as meal_type_name 
       FROM disposable_vouchers dv 
       JOIN meal_types mt ON dv.meal_type_id = mt.id 
       WHERE dv.id = ?`,
      [result.insertId]
    );

    res.json({ 
      success: true, 
      message: 'Voucher criado com sucesso',
      voucher: voucher[0]
    });
  } catch (error) {
    logger.error('Error creating disposable voucher:', error);
    res.status(500).json({ error: 'Erro ao criar voucher descartável' });
  } finally {
    if (db) db.release();
  }
});

export default router;