import express from 'express';
import { supabase } from '../config/supabase.js';
import logger from '../config/logger.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { password } = req.body;
  
  try {
    // Validar senha do admin
    if (!password) {
      return res.status(400).json({ 
        success: false,
        message: 'Senha é obrigatória'
      });
    }

    // Verificar senha no banco
    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('senha', password)
      .single();

    if (error || !admin) {
      return res.status(401).json({
        success: false,
        message: 'Senha inválida'
      });
    }

    // Gerar token JWT (você pode usar uma biblioteca como jsonwebtoken)
    const token = 'temp-admin-token'; // Substituir por geração real de token

    res.json({
      success: true,
      token,
      type: 'manager'
    });

  } catch (error) {
    logger.error('Erro no login de admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno no servidor'
    });
  }
});

export default router;