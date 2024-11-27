import express from 'express';
import { supabase } from '../config/supabase.js';
import logger from '../config/logger.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { usuario_id, datas, tipos_refeicao_ids, observacao } = req.body;
  
  logger.info('Recebida requisição para gerar vouchers extras:', { 
    usuario_id, 
    datas, 
    tipos_refeicao_ids,
    path: req.path,
    method: req.method 
  });

  try {
    // Validação dos dados de entrada
    if (!usuario_id) {
      return res.status(400).json({
        success: false,
        error: 'ID do usuário é obrigatório'
      });
    }

    if (!datas || !Array.isArray(datas) || datas.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'É necessário fornecer pelo menos uma data válida'
      });
    }

    // Validação de datas passadas
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const hasInvalidDate = datas.some(date => new Date(date) < today);
    if (hasInvalidDate) {
      return res.status(400).json({
        success: false,
        error: 'Não é possível gerar vouchers para datas passadas'
      });
    }

    // Se não foram especificados tipos de refeição, buscar todos os ativos
    let tiposRefeicao = tipos_refeicao_ids;
    if (!tiposRefeicao || !Array.isArray(tiposRefeicao) || tiposRefeicao.length === 0) {
      const { data: tiposAtivos, error: tiposError } = await supabase
        .from('tipos_refeicao')
        .select('id')
        .eq('ativo', true);

      if (tiposError) {
        logger.error('Erro ao buscar tipos de refeição:', tiposError);
        throw new Error('Erro ao buscar tipos de refeição');
      }

      tiposRefeicao = tiposAtivos.map(tipo => tipo.id);
    }

    // Verificar se o usuário existe
    const { data: userExists, error: userError } = await supabase
      .from('usuarios')
      .select('id')
      .eq('id', usuario_id)
      .single();

    if (userError || !userExists) {
      logger.error('Usuário não encontrado:', userError);
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    const vouchersParaInserir = datas.flatMap(data => 
      tiposRefeicao.map(tipo_refeicao_id => ({
        usuario_id,
        tipo_refeicao_id,
        autorizado_por: 'Sistema',
        codigo: Math.random().toString(36).substr(2, 8).toUpperCase(),
        valido_ate: new Date(data + 'T23:59:59-03:00').toISOString(),
        observacao: observacao || 'Voucher extra gerado via sistema',
        usado: false,
        criado_em: new Date().toISOString()
      }))
    );

    const { data: vouchersInseridos, error: insertError } = await supabase
      .from('vouchers_extras')
      .insert(vouchersParaInserir)
      .select();

    if (insertError) {
      logger.error('Erro ao inserir vouchers:', insertError);
      throw new Error('Erro ao gerar vouchers extras');
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