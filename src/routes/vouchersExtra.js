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
    if (!usuario_id && !tipos_refeicao_ids) {
      return res.status(400).json({
        success: false,
        error: 'ID do usuário ou tipos de refeição são obrigatórios'
      });
    }

    if (!datas || !Array.isArray(datas) || datas.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'É necessário fornecer pelo menos uma data válida'
      });
    }

    // Validação de datas passadas com timezone correto
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const hasInvalidDate = datas.some(date => {
      const dataVoucher = new Date(date + 'T00:00:00-03:00');
      return dataVoucher < today;
    });

    if (hasInvalidDate) {
      return res.status(400).json({
        success: false,
        error: 'Não é possível gerar vouchers para datas passadas'
      });
    }

    // Se tiver ID do usuário, verifica se ele existe
    if (usuario_id) {
      const { data: userExists, error: userError } = await supabase
        .from('usuarios')
        .select('id, nome')
        .eq('id', usuario_id)
        .single();

      if (userError) {
        logger.error('Erro ao buscar usuário:', userError);
        return res.status(500).json({
          success: false,
          error: 'Erro ao verificar usuário'
        });
      }

      if (!userExists) {
        return res.status(404).json({
          success: false,
          error: 'Usuário não encontrado'
        });
      }

      // Verificar se já existem vouchers para as datas selecionadas
      const { data: vouchersExistentes, error: vouchersError } = await supabase
        .from('vouchers_extras')
        .select('valido_ate')
        .eq('usuario_id', usuario_id)
        .in('valido_ate', datas.map(data => data + 'T23:59:59-03:00'))
        .eq('usado', false);

      if (vouchersError) {
        logger.error('Erro ao verificar vouchers existentes:', vouchersError);
        return res.status(500).json({
          success: false,
          error: 'Erro ao verificar vouchers existentes'
        });
      }

      if (vouchersExistentes?.length > 0) {
        const datasComVoucher = vouchersExistentes.map(v => 
          new Date(v.valido_ate).toISOString().split('T')[0]
        );
        return res.status(400).json({
          success: false,
          error: `Já existem vouchers não utilizados para as datas: ${datasComVoucher.join(', ')}`
        });
      }
    }

    // Preparar os vouchers para inserção
    const vouchersParaInserir = datas.flatMap(data => {
      const refeicoes = tipos_refeicao_ids || [];
      return refeicoes.map(() => ({
        usuario_id: usuario_id || null,
        tipo_refeicao_id: tipos_refeicao_ids ? tipos_refeicao_ids[0] : null,
        autorizado_por: 'Sistema',
        codigo: Math.random().toString(36).substr(2, 8).toUpperCase(),
        valido_ate: new Date(data + 'T23:59:59-03:00').toISOString(),
        observacao: observacao?.trim() || 'Voucher extra gerado via sistema',
        usado: false,
        criado_em: new Date().toISOString()
      }));
    });

    // Inserir os vouchers
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