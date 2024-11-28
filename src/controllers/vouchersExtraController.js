import { supabase } from '../config/supabase.js';
import logger from '../config/logger.js';
import { generateUniqueCode } from '../utils/voucherGenerationUtils.js';

export const createVoucherExtra = async (req, res) => {
  const { usuario_id, datas, observacao } = req.body;

  if (!usuario_id || !datas || !Array.isArray(datas) || datas.length === 0) {
    logger.error('Dados inválidos recebidos:', { usuario_id, datas, observacao });
    return res.status(400).json({
      success: false,
      error: 'Dados inválidos para geração de voucher extra'
    });
  }

  try {
    const vouchers = [];
    
    for (const data of datas) {
      const code = await generateUniqueCode();
      
      const { data: voucher, error } = await supabase
        .from('vouchers_extras')
        .insert([{
          codigo: code,
          usuario_id: usuario_id,
          data_expiracao: data,
          observacao: observacao || 'Voucher extra gerado via sistema',
          tipo: 'EXTRA'
        }])
        .select('*, usuarios(nome)')
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
      vouchers
    });
  } catch (error) {
    logger.error('Erro ao gerar vouchers extras:', error);
    return res.status(400).json({
      success: false,
      error: error.message || 'Erro ao gerar vouchers extras'
    });
  }
};