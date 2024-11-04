import pool from '../config/database';
import logger from '../config/logger';

export const checkVoucherCode = async (req, res) => {
  const { code } = req.body;
  let db;
  
  try {
    db = await pool.getConnection();
    
    // Validar formato do código
    if (!/^\d{4}$/.test(code)) {
      logger.warn(`Invalid voucher code format: ${code}`);
      return res.status(400).json({ 
        error: 'Código deve conter exatamente 4 dígitos',
        exists: false 
      });
    }

    // Verificar se o código já existe
    const [vouchers] = await db.execute(
      'SELECT id FROM disposable_vouchers WHERE code = ?',
      [code]
    );

    return res.json({ exists: vouchers.length > 0 });
  } catch (error) {
    logger.error('Error checking voucher code:', error);
    return res.status(500).json({ 
      error: 'Erro interno ao verificar código do voucher',
      exists: false
    });
  } finally {
    if (db) db.release();
  }
};

export const createDisposableVoucher = async (req, res) => {
  const { code, meal_type_id, created_by, expired_at } = req.body;
  let db;
  
  try {
    db = await pool.getConnection();
    
    // Validar formato do código
    if (!/^\d{4}$/.test(code)) {
      logger.warn(`Invalid voucher code format: ${code}`);
      return res.status(400).json({ 
        error: 'Código do voucher deve conter 4 dígitos numéricos'
      });
    }

    // Verificar se o código já existe
    const [existingVouchers] = await db.execute(
      'SELECT id FROM disposable_vouchers WHERE code = ?',
      [code]
    );

    if (existingVouchers.length > 0) {
      logger.warn(`Duplicate voucher code attempt: ${code}`);
      return res.status(400).json({ 
        error: 'Código de voucher já existe'
      });
    }

    // Verificar se o tipo de refeição existe e está ativo
    const [mealTypes] = await db.execute(
      'SELECT id FROM meal_types WHERE id = ? AND is_active = TRUE',
      [meal_type_id]
    );

    if (mealTypes.length === 0) {
      logger.warn(`Invalid or inactive meal type: ${meal_type_id}`);
      return res.status(400).json({ 
        error: 'Tipo de refeição inválido ou inativo'
      });
    }

    // Inserir o novo voucher
    const [result] = await db.execute(
      `INSERT INTO disposable_vouchers 
       (code, meal_type_id, created_by, expired_at) 
       VALUES (?, ?, ?, ?)`,
      [code, meal_type_id, created_by, expired_at]
    );

    // Buscar o voucher criado com informações completas
    const [voucher] = await db.execute(
      `SELECT dv.*, mt.name as meal_type_name 
       FROM disposable_vouchers dv 
       JOIN meal_types mt ON dv.meal_type_id = mt.id 
       WHERE dv.id = ?`,
      [result.insertId]
    );

    logger.info(`Disposable voucher created successfully: ${code}`);
    return res.json({ 
      success: true, 
      message: 'Voucher criado com sucesso',
      voucher: voucher[0]
    });
  } catch (error) {
    logger.error('Error creating disposable voucher:', error);
    return res.status(500).json({ 
      error: 'Erro interno ao criar voucher descartável'
    });
  } finally {
    if (db) db.release();
  }
};

export const validateDisposableVoucher = async (req, res) => {
  const { code, mealType } = req.body;
  let db;
  
  try {
    db = await pool.getConnection();
    
    if (!/^\d{4}$/.test(code)) {
      return res.status(400).json({ 
        error: 'Código do voucher deve conter 4 dígitos numéricos'
      });
    }

    const [vouchers] = await db.execute(
      `SELECT dv.*, mt.name as meal_type_name 
       FROM disposable_vouchers dv 
       JOIN meal_types mt ON dv.meal_type_id = mt.id 
       WHERE dv.code = ? AND dv.is_used = FALSE 
       AND (dv.expired_at IS NULL OR dv.expired_at > NOW())`,
      [code]
    );

    if (vouchers.length === 0) {
      return res.status(401).json({ 
        error: 'Voucher inválido ou expirado'
      });
    }

    const voucher = vouchers[0];
    
    if (voucher.meal_type_name !== mealType) {
      return res.status(400).json({ 
        error: 'Tipo de refeição inválido para este voucher'
      });
    }

    await db.execute(
      'UPDATE disposable_vouchers SET is_used = TRUE, used_at = NOW(3) WHERE id = ?',
      [voucher.id]
    );

    return res.json({ 
      success: true, 
      message: 'Voucher validado com sucesso'
    });
  } catch (error) {
    logger.error('Error validating disposable voucher:', error);
    return res.status(500).json({ 
      error: 'Erro interno ao validar voucher descartável'
    });
  } finally {
    if (db) db.release();
  }
};