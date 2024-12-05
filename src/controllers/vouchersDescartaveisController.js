import pool from '../config/database';
import logger from '../config/logger';
import { generateUniqueCode } from '../utils/voucherGenerationUtils';
import { validateDisposableVoucherRules } from '../utils/voucherValidations';

export const checkVoucherCode = async (req, res) => {
  const { code } = req.body;
  let db;
  
  try {
    db = await pool.getConnection();
    const [vouchers] = await db.execute(
      `SELECT dv.*, mt.name as meal_type_name, mt.start_time, mt.end_time, 
              mt.tolerance_minutes, mt.value
       FROM disposable_vouchers dv 
       JOIN meal_types mt ON dv.meal_type_id = mt.id 
       WHERE dv.code = ? AND dv.is_used = FALSE`,
      [code]
    );

    if (vouchers.length === 0) {
      return res.json({ 
        exists: false,
        message: 'Voucher Descartável não encontrado ou já utilizado'
      });
    }

    try {
      validateDisposableVoucherRules(vouchers[0]);
      return res.json({ 
        exists: true,
        voucher: vouchers[0]
      });
    } catch (validationError) {
      return res.json({
        exists: false,
        message: validationError.message
      });
    }
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

export const validateDisposableVoucher = async (req, res) => {
  const { codigo, tipo_refeicao_id } = req.body;
  
  try {
    console.log('Iniciando validação do voucher:', codigo);

    // Buscar o voucher com um bloqueio otimista usando single()
    const { data: voucher, error: voucherError } = await supabase
      .from('vouchers_descartaveis')
      .select(`
        *,
        tipos_refeicao (*)
      `)
      .eq('codigo', codigo)
      .eq('usado', false)
      .single();

    if (voucherError || !voucher) {
      console.log('Voucher não encontrado ou já utilizado:', voucherError);
      return res.status(404).json({
        success: false,
        error: 'Voucher não encontrado ou já utilizado'
      });
    }

    // Verificar se o tipo de refeição corresponde
    if (voucher.tipo_refeicao_id !== tipo_refeicao_id) {
      console.log('Tipo de refeição não corresponde:', {
        voucher: voucher.tipo_refeicao_id,
        requested: tipo_refeicao_id
      });
      return res.status(400).json({
        success: false,
        error: 'Este voucher não é válido para este tipo de refeição'
      });
    }

    // Validar regras do voucher (data de expiração, horário, etc)
    await validateDisposableVoucherRules(voucher, supabase);

    // Marcar voucher como usado usando uma transação para evitar condições de corrida
    const { data: updatedVoucher, error: updateError } = await supabase
      .from('vouchers_descartaveis')
      .update({
        usado: true,
        data_uso: new Date().toISOString()
      })
      .eq('id', voucher.id)
      .eq('usado', false) // Garantir que não foi usado entre a validação e a atualização
      .select()
      .single();

    if (updateError || !updatedVoucher) {
      console.log('Erro ao atualizar voucher:', updateError);
      return res.status(400).json({
        success: false,
        error: 'Este voucher já foi utilizado'
      });
    }

    logger.info(`Voucher ${codigo} validado com sucesso`);
    return res.json({
      success: true,
      message: 'Voucher validado com sucesso'
    });

  } catch (error) {
    logger.error('Erro ao validar voucher:', error);
    return res.status(400).json({
      success: false,
      error: error.message || 'Erro ao validar voucher'
    });
  }
};

export const createDisposableVoucher = async (req, res) => {
  const { meal_type_id, expired_at } = req.body;
  let db;
  
  try {
    if (!meal_type_id || !expired_at) {
      return res.status(400).json({ 
        error: 'Tipo de refeição e data de expiração são obrigatórios'
      });
    }

    db = await pool.getConnection();
    
    // Verificar se o tipo de refeição existe e é válido
    const [mealTypes] = await db.execute(
      'SELECT * FROM meal_types WHERE id = ? AND is_active = TRUE AND name != "Extra"',
      [meal_type_id]
    );

    if (mealTypes.length === 0) {
      return res.status(400).json({ 
        error: 'Tipo de refeição inválido, inativo ou não permitido para voucher descartável'
      });
    }

    // Ajusta a data de expiração para 23:59:59 do mesmo dia
    const expirationDate = new Date(expired_at);
    expirationDate.setHours(23, 59, 59, 999);
    const formattedExpiration = expirationDate.toISOString().slice(0, 19).replace('T', ' ');

    const code = await generateUniqueCode(db);

    const [result] = await db.execute(
      'INSERT INTO disposable_vouchers (code, meal_type_id, expired_at) VALUES (?, ?, ?)',
      [code, meal_type_id, formattedExpiration]
    );

    const [voucher] = await db.execute(
      `SELECT dv.*, mt.name as meal_type_name
       FROM disposable_vouchers dv 
       JOIN meal_types mt ON dv.meal_type_id = mt.id 
       WHERE dv.id = ?`,
      [result.insertId]
    );

    logger.info(`Voucher descartável criado com sucesso: ${code}`);
    return res.json({ 
      success: true, 
      message: 'Voucher criado com sucesso',
      voucher: voucher[0]
    });
  } catch (error) {
    logger.error('Erro ao criar voucher descartável:', error);
    return res.status(400).json({ 
      error: 'Erro ao criar voucher descartável: ' + error.message
    });
  } finally {
    if (db) db.release();
  }
};
