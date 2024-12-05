import { supabase } from '../config/supabase.js';
import logger from '../config/logger.js';

const generateUniqueCode = async () => {
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  
  const { data } = await supabase
    .from('vouchers_descartaveis')
    .select('codigo')
    .eq('codigo', code);

  if (data && data.length > 0) {
    return generateUniqueCode();
  }

  return code;
};

export const generateDisposableVouchers = async (req, res) => {
  try {
    logger.info('Iniciando geração de vouchers descartáveis');
    const { tipos_refeicao_ids, datas, quantidade } = req.body;

    logger.info('Dados recebidos:', { tipos_refeicao_ids, datas, quantidade });

    if (!tipos_refeicao_ids?.length || !datas?.length || !quantidade) {
      logger.error('Dados inválidos recebidos:', { tipos_refeicao_ids, datas, quantidade });
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos para geração de vouchers'
      });
    }

    const vouchers = [];
    
    for (const data of datas) {
      for (const tipo_refeicao_id of tipos_refeicao_ids) {
        for (let i = 0; i < quantidade; i++) {
          const code = await generateUniqueCode();
          
          logger.info(`Gerando voucher com código ${code} para data ${data}`);
          
          const { data: voucher, error } = await supabase
            .from('vouchers_descartaveis')
            .insert({
              codigo: code,
              tipo_refeicao_id: tipo_refeicao_id,
              data_expiracao: data,
              usado: false,
              data_criacao: new Date().toISOString()
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
            logger.error('Erro ao inserir voucher:', error);
            throw error;
          }

          vouchers.push(voucher);
        }
      }
    }

    logger.info(`${vouchers.length} vouchers gerados com sucesso`);
    return res.json({
      success: true,
      message: `${vouchers.length} voucher(s) descartável(is) gerado(s) com sucesso!`,
      vouchers
    });
  } catch (error) {
    logger.error('Erro ao gerar vouchers:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao gerar vouchers descartáveis'
    });
  }
};