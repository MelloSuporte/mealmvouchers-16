import pool from '../config/database';
import logger from '../config/logger';
import { createVoucher, validateMealType } from '../services/disposableVoucherService';

export const checkVoucherCode = async (req, res) => {
  const { code } = req.body;
  let db;
  
  try {
    db = await pool.getConnection();
    
    if (!/^\d{4}$/.test(code)) {
      logger.warn(`Formato inválido de código: ${code}`);
      return res.status(400).json({ 
        error: 'Código deve conter exatamente 4 dígitos numéricos',
        exists: false 
      });
    }

    const [disposableVouchers] = await db.execute(
      'SELECT id FROM disposable_vouchers WHERE code = ?',
      [code]
    );

    const [userVouchers] = await db.execute(
      'SELECT id FROM users WHERE voucher = ?',
      [code]
    );

    return res.json({ exists: disposableVouchers.length > 0 || userVouchers.length > 0 });
  } catch (error) {
    logger.error('Erro ao verificar código do voucher:', error);
    return res.status(500).json({ 
      error: 'Erro interno ao verificar código do voucher',
      exists: false
    });
  } finally {
    if (db) db.release();
  }
};

export const createDisposableVoucher = async (req, res) => {
  const { meal_type_id, expired_at } = req.body;
  
  try {
    if (!meal_type_id || !expired_at) {
      return res.status(400).json({ 
        error: 'Todos os campos são obrigatórios (meal_type_id, expired_at)'
      });
    }

    // Usar o ID do usuário admin que está logado
    const adminToken = req.headers.authorization;
    if (!adminToken || adminToken !== 'admin-authenticated') {
      return res.status(401).json({ 
        error: 'Usuário não autorizado'
      });
    }

    // ID fixo do usuário admin (1)
    const created_by = 1;

    await validateMealType(meal_type_id);
    const voucher = await createVoucher(meal_type_id, expired_at, created_by);

    return res.json({ 
      success: true, 
      message: 'Voucher criado com sucesso',
      voucher 
    });
  } catch (error) {
    logger.error('Erro ao criar voucher descartável:', error);
    return res.status(400).json({ 
      error: error.message || 'Erro ao criar voucher descartável'
    });
  }
};
