import express from 'express';
import { supabase } from '../config/supabase.js';
import logger from '../config/logger.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { tipos_refeicao_ids, datas, observacao } = req.body;
  
  logger.info('Recebida requisição para gerar vouchers extras:', { tipos_refeicao_ids, datas });

  try {
    if (!tipos_refeicao_ids || !datas || !Array.isArray(datas) || datas.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos para geração de vouchers'
      });
    }

    const vouchersParaInserir = [];
    
    for (const data of datas) {
      for (const tipo_refeicao_id of tipos_refeicao_ids) {
        vouchersParaInserir.push({
          tipo_refeicao_id,
          valido_ate: data,
          autorizado_por: 'Sistema',
          observacao: observacao || 'Voucher extra gerado via sistema',
          usado: false,
          criado_em: new Date().toISOString()
        });
      }
    }

    const { data: vouchersInseridos, error: insertError } = await supabase
      .from('vouchers_extras')
      .insert(vouchersParaInserir)
      .select();

    if (insertError) {
      logger.error('Erro ao inserir vouchers:', insertError);
      return res.status(500).json({
        success: false,
        error: 'Erro ao gerar vouchers extras'
      });
    }

    logger.info(`${vouchersInseridos.length} vouchers extras gerados com sucesso`);

    return res.status(201).json({
      success: true,
      message: `${vouchersInseridos.length} voucher(s) extra(s) gerado(s) com sucesso!`,
      vouchers: vouchersInseridos
    });

  } catch (error) {
    logger.error('Erro ao processar requisição de vouchers extras:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno ao gerar vouchers extras'
    });
  }
});

export default router;