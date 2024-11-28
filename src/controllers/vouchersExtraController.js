import { supabase } from '../config/supabase.js';
import logger from '../config/logger.js';
import { generateUniqueCode } from '../utils/voucherGenerationUtils.js';

export const createVoucherExtra = async (req, res) => {
  const { usuario_id, datas, observacao, tipo_refeicao_id } = req.body;

  if (!usuario_id || !datas || !Array.isArray(datas) || datas.length === 0) {
    logger.error('Dados inválidos recebidos:', { usuario_id, datas, observacao });
    return res.status(400).json({
      success: false,
      error: 'Dados inválidos para geração de voucher extra'
    });
  }

  try {
    const vouchers = [];
    
    // Buscar o primeiro tipo de refeição ativo (fallback)
    let refeicaoId = tipo_refeicao_id;
    if (!refeicaoId) {
      const { data: tipoRefeicao } = await supabase
        .from('tipos_refeicao')
        .select('id')
        .eq('ativo', true)
        .limit(1)
        .single();
      
      if (tipoRefeicao) {
        refeicaoId = tipoRefeicao.id;
      }
    }

    for (const data of datas) {
      const codigo = await generateUniqueCode();
      
      const { data: voucher, error } = await supabase
        .from('vouchers_extras')
        .insert([{
          usuario_id,
          tipo_refeicao_id: refeicaoId,
          autorizado_por: 'Sistema',
          codigo,
          valido_ate: data,
          observacao: observacao || 'Voucher extra gerado via sistema'
        }])
        .select()
        .single();

      if (error) {
        logger.error('Erro ao inserir voucher extra:', error);
        throw new Error(error.message);
      }

      vouchers.push(voucher);
    }

    logger.info(`${vouchers.length} vouchers extras gerados com sucesso para usuário ${usuario_id}`);
    return res.status(201).json({
      success: true,
      message: `${vouchers.length} voucher(s) extra(s) gerado(s) com sucesso!`,
      data: vouchers
    });
  } catch (error) {
    logger.error('Erro ao gerar vouchers extras:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro ao gerar vouchers extras'
    });
  }
};