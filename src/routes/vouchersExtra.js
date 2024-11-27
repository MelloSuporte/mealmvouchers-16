import express from 'express';
import { supabase } from '../config/supabase.js';
import logger from '../config/logger.js';

const router = express.Router();

router.post('/generate', async (req, res) => {
  const { usuario_id, datas, observacao } = req.body;

  logger.info('Iniciando geração de vouchers extras:', { usuario_id, datas });

  try {
    if (!usuario_id) {
      return res.status(400).json({
        success: false,
        error: 'ID do tipo de refeição é obrigatório'
      });
    }

    if (!datas || !Array.isArray(datas) || datas.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Selecione pelo menos uma data válida'
      });
    }

    const vouchersGerados = [];
    const warnings = [];

    for (const data of datas) {
      try {
        // Verifica se já existe um voucher para esta data e tipo de refeição
        const { data: existingVoucher, error: checkError } = await supabase
          .from('vouchers_extras')
          .select('id')
          .eq('tipo_refeicao_id', usuario_id)
          .eq('valido_ate', data)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          throw checkError;
        }

        if (existingVoucher) {
          warnings.push(`Já existe um voucher para a data ${data}`);
          continue;
        }

        // Insere novo voucher
        const { data: novoVoucher, error: insertError } = await supabase
          .from('vouchers_extras')
          .insert([{
            tipo_refeicao_id: usuario_id,
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
        logger.info(`Voucher gerado com sucesso para data ${data}`);
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