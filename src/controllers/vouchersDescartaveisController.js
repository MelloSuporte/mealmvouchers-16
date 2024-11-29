import { supabase } from '../config/supabase.js';
import logger from '../config/logger.js';
import { generateUniqueCode } from '../utils/voucherGenerationUtils.js';

export const generateDisposableVouchers = async (req, res) => {
  const { tipos_refeicao_ids, datas, quantidade } = req.body;

  try {
    const vouchers = [];
    
    for (const data of datas) {
      for (const tipo_refeicao_id of tipos_refeicao_ids) {
        for (let i = 0; i < quantidade; i++) {
          const code = await generateUniqueCode();
          
          const { data: voucher, error } = await supabase
            .from('vouchers_descartaveis')
            .insert({
              codigo: code,
              tipo_refeicao_id: tipo_refeicao_id,
              data_expiracao: data,
              usado: false
            })
            .select(`
              *,
              tipos_refeicao (
                nome,
                valor
              )
            `)
            .single();

          if (error) {
            logger.error('Erro ao inserir voucher descartável:', error);
            throw error;
          }

          vouchers.push(voucher);
        }
      }
    }

    logger.info(`${vouchers.length} vouchers descartáveis gerados com sucesso`);
    return res.json({
      success: true,
      message: `${vouchers.length} voucher(s) descartável(is) gerado(s) com sucesso!`,
      vouchers
    });
  } catch (error) {
    logger.error('Erro ao gerar vouchers descartáveis:', error);
    return res.status(400).json({
      success: false,
      error: error.message || 'Erro ao gerar vouchers descartáveis'
    });
  }
};