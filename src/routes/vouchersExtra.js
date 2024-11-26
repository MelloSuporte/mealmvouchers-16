import express from 'express';
import { supabase } from '../config/supabase';
import logger from '../config/logger';

const router = express.Router();

// Rota para gerar vouchers extras
router.post('/generate', async (req, res) => {
  const { usuario_id, datas, observacao } = req.body;

  try {
    if (!usuario_id || !datas || !Array.isArray(datas)) {
      return res.status(400).json({ 
        success: false,
        error: 'Dados inválidos. Usuário e datas são obrigatórios.' 
      });
    }

    const vouchers = [];
    
    for (const data of datas) {
      const { data: voucher, error } = await supabase
        .from('vouchers_extras')
        .insert([{
          usuario_id,
          autorizado_por: 'Sistema',
          valido_ate: new Date(data),
          observacao: observacao || 'Voucher extra gerado pelo sistema'
        }])
        .select()
        .single();

      if (error) {
        logger.error('Erro ao criar voucher extra:', error);
        throw error;
      }
      
      if (voucher) {
        vouchers.push(voucher);
      }
    }

    res.status(201).json({ 
      success: true,
      message: 'Vouchers extras criados com sucesso',
      vouchers: vouchers
    });
  } catch (error) {
    logger.error('Error creating extra vouchers:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Erro ao criar vouchers extras'
    });
  }
});

// Rota para listar vouchers extras de um usuário
router.get('/user/:id', async (req, res) => {
  try {
    const { data: vouchers, error } = await supabase
      .from('vouchers_extras')
      .select('*')
      .eq('usuario_id', req.params.id)
      .order('criado_em', { ascending: false });

    if (error) throw error;

    res.json(vouchers);
  } catch (error) {
    logger.error('Error fetching user extra vouchers:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro ao buscar vouchers extras' 
    });
  }
});

export default router;