import express from 'express';
import { supabase } from '../config/supabase.js';
import logger from '../config/logger.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { usuario_id, datas, observacao } = req.body;
  
  logger.info('Recebida requisição para gerar vouchers extras:', { usuario_id, datas });

  try {
    if (!usuario_id || !datas || !Array.isArray(datas) || datas.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos para geração de vouchers'
      });
    }

    // Busca o tipo de refeição extra padrão
    const { data: tipoRefeicao, error: tipoError } = await supabase
      .from('tipos_refeicao')
      .select('id')
      .eq('nome', 'Refeição Extra')
      .single();

    if (tipoError || !tipoRefeicao) {
      logger.error('Erro ao buscar tipo de refeição:', tipoError);
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar tipo de refeição'
      });
    }

    const vouchersParaInserir = datas.map(data => ({
      usuario_id: usuario_id,
      tipo_refeicao_id: tipoRefeicao.id,
      valido_ate: data,
      autorizado_por: 'Sistema',
      observacao: observacao || 'Voucher extra gerado via sistema',
      usado: false,
      criado_em: new Date().toISOString()
    }));

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