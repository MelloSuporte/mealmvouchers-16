import { supabase } from '../config/supabase.js';
import logger from '../config/logger.js';
import { validateDisposableVoucherRules } from '../utils/voucherValidations.js';

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
        // Verificar se o tipo de refeição é válido
        const { data: tipoRefeicao, error: tipoRefeicaoError } = await supabase
          .from('tipos_refeicao')
          .select('*')
          .eq('id', tipo_refeicao_id)
          .single();

        if (tipoRefeicaoError || !tipoRefeicao) {
          logger.error('Tipo de refeição inválido:', tipo_refeicao_id);
          continue;
        }

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

export const validateDisposableVoucher = async (req, res) => {
  const { codigo, tipo_refeicao_id } = req.body;
  
  try {
    console.log('Iniciando validação do voucher:', codigo);

    // Verificar se o voucher existe e não foi usado
    const { data: voucher, error } = await supabase
      .from('vouchers_descartaveis')
      .select(`
        *,
        tipos_refeicao (*)
      `)
      .eq('codigo', codigo)
      .eq('usado', false)
      .single();

    if (error || !voucher) {
      console.log('Voucher não encontrado ou já utilizado:', error);
      return res.status(404).json({
        success: false,
        error: 'Voucher não encontrado ou já utilizado'
      });
    }

    // Verificar se o tipo de refeição corresponde
    if (voucher.tipo_refeicao_id !== parseInt(tipo_refeicao_id)) {
      console.log('Tipo de refeição não corresponde:', {
        voucher: voucher.tipo_refeicao_id,
        requested: tipo_refeicao_id
      });
      return res.status(400).json({
        success: false,
        error: 'Este voucher não é válido para este tipo de refeição'
      });
    }

    // Validar regras do voucher (data de expiração, horário, etc)
    await validateDisposableVoucherRules(voucher, supabase);

    // Marcar voucher como usado usando uma transação para evitar condições de corrida
    const { data: updatedVoucher, error: updateError } = await supabase
      .from('vouchers_descartaveis')
      .update({
        usado: true,
        data_uso: new Date().toISOString()
      })
      .eq('id', voucher.id)
      .eq('usado', false) // Garantir que não foi usado entre a validação e a atualização
      .select()
      .single();

    if (updateError || !updatedVoucher) {
      console.log('Erro ao atualizar voucher:', updateError);
      return res.status(400).json({
        success: false,
        error: 'Este voucher já foi utilizado'
      });
    }

    logger.info(`Voucher ${codigo} validado com sucesso`);
    return res.json({
      success: true,
      message: 'Voucher validado com sucesso'
    });

  } catch (error) {
    logger.error('Erro ao validar voucher:', error);
    return res.status(400).json({
      success: false,
      error: error.message || 'Erro ao validar voucher'
    });
  }
};