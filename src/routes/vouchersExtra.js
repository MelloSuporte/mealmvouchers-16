import express from 'express';
import { supabase } from '../config/supabase.js';
import logger from '../config/logger.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { usuario_id, datas, observacao } = req.body;

  logger.info('Iniciando geração de vouchers extras:', { usuario_id, datas });

  try {
    if (!datas || !Array.isArray(datas) || datas.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Selecione pelo menos uma data válida'
      });
    }

    if (!usuario_id) {
      return res.status(400).json({
        success: false,
        error: 'Usuário não selecionado'
      });
    }

    // Verifica se o usuário existe
    const { data: user, error: userError } = await supabase
      .from('usuarios')
      .select('id')
      .eq('id', usuario_id)
      .single();

    if (userError || !user) {
      logger.error('Erro ao verificar usuário:', userError);
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    const vouchersGerados = [];
    const warnings = [];

    for (const data of datas) {
      try {
        // Verifica se já existe um voucher para esta data
        const { data: existingVoucher, error: checkError } = await supabase
          .from('vouchers_extras')
          .select('id')
          .eq('usuario_id', usuario_id)
          .eq('valido_ate', data)
          .maybeSingle();

        if (checkError && checkError.code !== 'PGRST116') {
          throw checkError;
        }

        if (existingVoucher) {
          warnings.push(`Já existe um voucher para a data ${data}`);
          continue;
        }

        // Insere o novo voucher
        const { data: novoVoucher, error: insertError } = await supabase
          .from('vouchers_extras')
          .insert([{
            usuario_id,
            valido_ate: data,
            observacao: observacao || 'Voucher extra gerado pelo sistema',
            autorizado_por: 'Sistema',
            usado: false,
            criado_em: new Date().toISOString()
          }])
          .select()
          .single();

        if (insertError) throw insertError;

        vouchersGerados.push(novoVoucher);
        
      } catch (error) {
        logger.error(`Erro ao gerar voucher para data ${data}:`, error);
        warnings.push(`Erro ao gerar voucher para data ${data}: ${error.message}`);
      }
    }

    if (vouchersGerados.length === 0 && warnings.length > 0) {
      return res.status(400).json({
        success: false,
        error: warnings.join(', ')
      });
    }

    return res.status(201).json({
      success: true,
      message: `${vouchersGerados.length} voucher(s) gerado(s) com sucesso`,
      vouchers: vouchersGerados,
      warnings: warnings.length > 0 ? warnings : undefined
    });

  } catch (error) {
    logger.error('Erro ao gerar vouchers:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno ao gerar vouchers'
    });
  }
});

export default router;