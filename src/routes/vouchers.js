import express from 'express';
import { supabase } from '../config/supabase.js';
import logger from '../config/logger.js';

const router = express.Router();

router.post('/validate', async (req, res) => {
  const { cpf, voucherCode: code, mealType } = req.body;
  
  try {
    const cleanCpf = cpf ? cpf.replace(/[^\d]/g, '') : '';
    const cleanCode = code.toString().trim();

    logger.info(`Validating voucher - CPF: ${cleanCpf}, Code: ${cleanCode}, Type: ${mealType}`);

    // Check disposable voucher
    const { data: disposableVoucher } = await supabase
      .from('disposable_vouchers')
      .select('*, meal_types(*)')
      .eq('code', cleanCode)
      .eq('is_used', false)
      .single();

    if (disposableVoucher) {
      if (disposableVoucher.meal_type_id !== parseInt(mealType)) {
        return res.status(400).json({ error: 'Tipo de refeição não corresponde ao voucher descartável' });
      }

      const { error: updateError } = await supabase
        .from('disposable_vouchers')
        .update({ is_used: true, used_at: new Date().toISOString() })
        .eq('id', disposableVoucher.id);

      if (updateError) throw updateError;

      return res.json({ success: true, message: 'Voucher descartável validado com sucesso' });
    }

    // Check regular voucher
    if (!cleanCpf) {
      return res.status(400).json({ error: 'CPF é obrigatório para vouchers normais e extras' });
    }

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('cpf', cleanCpf)
      .eq('voucher', cleanCode)
      .eq('is_suspended', false)
      .single();

    if (!user) {
      return res.status(401).json({ 
        error: 'Usuário não encontrado ou voucher inválido',
        userName: null,
        turno: null 
      });
    }

    // Register voucher usage
    const { error: usageError } = await supabase
      .from('voucher_usage')
      .insert([{
        user_id: user.id,
        meal_type: mealType,
        used_at: new Date().toISOString()
      }]);

    if (usageError) throw usageError;

    res.json({ 
      success: true, 
      message: 'Voucher validado com sucesso',
      userName: user.name,
      turno: user.turno
    });

  } catch (error) {
    logger.error('Error validating voucher:', error);
    res.status(400).json({ error: error.message || 'Erro ao validar voucher' });
  }
});

router.post('/check', async (req, res) => {
  const { code } = req.body;
  
  try {
    const { data: voucher } = await supabase
      .from('disposable_vouchers')
      .select('*, meal_types(*)')
      .eq('code', code)
      .eq('is_used', false)
      .single();

    if (!voucher) {
      return res.json({ 
        exists: false,
        message: 'Voucher Descartável não encontrado ou já utilizado'
      });
    }

    return res.json({ 
      exists: true,
      voucher
    });
  } catch (error) {
    logger.error('Error checking voucher:', error);
    return res.status(500).json({ 
      error: 'Erro ao verificar voucher',
      exists: false
    });
  }
});

router.post('/create', async (req, res) => {
  const { meal_type_id, expired_at } = req.body;
  
  try {
    if (!meal_type_id || !expired_at) {
      return res.status(400).json({ error: 'Tipo de refeição e data de expiração são obrigatórios' });
    }

    // Generate unique code
    const code = String(Math.floor(1000 + Math.random() * 9000));

    const { data: voucher, error } = await supabase
      .from('disposable_vouchers')
      .insert([{
        code,
        meal_type_id,
        expired_at: new Date(expired_at).toISOString(),
        is_used: false
      }])
      .select('*, meal_types(*)')
      .single();

    if (error) throw error;

    res.json({ 
      success: true, 
      message: 'Voucher criado com sucesso',
      voucher
    });
  } catch (error) {
    logger.error('Error creating voucher:', error);
    res.status(400).json({ error: 'Erro ao criar voucher' });
  }
});

export default router;