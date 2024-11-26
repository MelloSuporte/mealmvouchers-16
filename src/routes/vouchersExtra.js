import express from 'express';
import { supabase } from '../config/supabase.js';
import logger from '../config/logger.js';

const router = express.Router();

// Rota para gerar vouchers extras
router.post('/generate', async (req, res) => {
  const { usuario_id, datas, observacao } = req.body;

  try {
    if (!usuario_id) {
      return res.status(400).json({ 
        success: false,
        error: 'ID do usuário é obrigatório' 
      });
    }

    if (!datas || !Array.isArray(datas) || datas.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Selecione pelo menos uma data válida' 
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
    const erros = [];
    
    for (const data of datas) {
      try {
        // Verificar se já existe voucher para esta data
        const { data: existingVoucher } = await supabase
          .from('vouchers_extras')
          .select('id')
          .eq('usuario_id', usuario_id)
          .eq('valido_ate', data)
          .single();

        if (existingVoucher) {
          erros.push(`Já existe um voucher para a data ${data}`);
          continue;
        }

        // Inserir novo voucher
        const { data: voucher, error: insertError } = await supabase
          .from('vouchers_extras')
          .insert({
            usuario_id: usuario_id,
            valido_ate: data,
            observacao: observacao || 'Voucher extra gerado pelo sistema',
            autorizado_por: 'Sistema',
            usado: false
          })
          .select()
          .single();

        if (insertError) {
          logger.error('Erro ao inserir voucher:', insertError);
          erros.push(`Erro ao gerar voucher para data ${data}`);
        } else {
          vouchers.push(voucher);
        }
      } catch (error) {
        logger.error('Erro ao processar voucher:', error);
        erros.push(`Erro ao processar data ${data}`);
      }
    }

    if (vouchers.length === 0) {
      return res.status(400).json({
        success: false,
        error: erros.length > 0 
          ? `Erro ao gerar vouchers: ${erros.join(', ')}` 
          : 'Não foi possível gerar nenhum voucher extra'
      });
    }

    return res.status(201).json({ 
      success: true,
      message: `${vouchers.length} voucher(s) extra(s) criado(s) com sucesso`,
      vouchers: vouchers,
      warnings: erros.length > 0 ? erros : undefined
    });

  } catch (error) {
    logger.error('Erro ao criar vouchers extras:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Erro ao gerar vouchers extras'
    });
  }
});

export default router;