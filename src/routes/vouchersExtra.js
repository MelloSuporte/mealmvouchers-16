import express from 'express';
import { supabase } from '../config/supabase.js';
import logger from '../config/logger.js';

const router = express.Router();

router.post('/generate', async (req, res) => {
  const { usuario_id, datas, observacao } = req.body;

  try {
    if (!usuario_id || !datas || !Array.isArray(datas)) {
      logger.error('Dados inválidos recebidos:', { usuario_id, datas });
      return res.status(400).json({ 
        success: false,
        error: 'Dados inválidos. Usuário e datas são obrigatórios.' 
      });
    }

    // Verificar se o usuário existe
    const { data: usuario, error: userError } = await supabase
      .from('usuarios')
      .select('id, nome')
      .eq('id', usuario_id)
      .single();

    if (userError || !usuario) {
      logger.error('Erro ao verificar usuário:', userError);
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    const vouchers = [];
    
    for (const data of datas) {
      // Verificar se já existe voucher para esta data
      const { data: existingVoucher } = await supabase
        .from('vouchers_extras')
        .select('id')
        .eq('usuario_id', usuario_id)
        .eq('data_validade', data)
        .single();

      if (existingVoucher) {
        logger.warn(`Voucher já existe para usuário ${usuario_id} na data ${data}`);
        continue;
      }

      const { data: voucher, error } = await supabase
        .from('vouchers_extras')
        .insert([{
          usuario_id,
          data_validade: new Date(data),
          observacao: observacao || 'Voucher extra gerado pelo sistema',
          autorizado_por: 'Sistema'
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

    if (vouchers.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Não foi possível gerar nenhum voucher extra. Verifique se já existem vouchers para as datas selecionadas.'
      });
    }

    res.status(201).json({ 
      success: true,
      message: `${vouchers.length} voucher(s) extra(s) criado(s) com sucesso`,
      vouchers: vouchers
    });
  } catch (error) {
    logger.error('Erro ao criar vouchers extras:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Erro ao criar vouchers extras'
    });
  }
});

export default router;