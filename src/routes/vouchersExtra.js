import express from 'express';
import { supabase } from '../config/supabase.js';
import logger from '../config/logger.js';

const router = express.Router();

// Rota para gerar vouchers extras
router.post('/generate', async (req, res) => {
  const { usuario_id, tipos_refeicao_ids, datas, observacao } = req.body;

  logger.info('Iniciando geração de vouchers extras:', { usuario_id, tipos_refeicao_ids, datas });

  try {
    // Validações
    if (!datas || !Array.isArray(datas) || datas.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Selecione pelo menos uma data válida'
      });
    }

    // Se for voucher para usuário específico
    if (usuario_id) {
      const { data: user, error: userError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('id', usuario_id)
        .single();

      if (userError || !user) {
        logger.error('Erro ao verificar usuário:', userError);
        return res.status(404).json({
          success: false,
          error: 'Usuário não encontrado'
        });
      }
    }

    // Se for voucher com tipos de refeição
    if (tipos_refeicao_ids) {
      if (!Array.isArray(tipos_refeicao_ids) || tipos_refeicao_ids.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Selecione pelo menos um tipo de refeição'
        });
      }
    }

    const vouchersGerados = [];
    const warnings = [];

    for (const data of datas) {
      try {
        // Verificar se já existe voucher para esta data e usuário
        if (usuario_id) {
          const { data: existingVoucher, error: checkError } = await supabase
            .from('vouchers_extras')
            .select('id')
            .eq('usuario_id', usuario_id)
            .eq('valido_ate', data)
            .maybeSingle();

          if (checkError && checkError.code !== 'PGRST116') {
            throw checkError;
          }

          if (existingVoucher) {
            warnings.push(`Já existe um voucher para a data ${data}`);
            continue;
          }
        }

        // Preparar dados do voucher
        const voucherData = {
          valido_ate: data,
          observacao: observacao || 'Voucher extra gerado pelo sistema',
          autorizado_por: 'Sistema',
          usado: false,
          criado_em: new Date().toISOString()
        };

        // Adicionar usuario_id se fornecido
        if (usuario_id) {
          voucherData.usuario_id = usuario_id;
        }

        // Adicionar tipo_refeicao_id se fornecido
        if (tipos_refeicao_ids) {
          for (const tipo_refeicao_id of tipos_refeicao_ids) {
            const voucherWithMealType = {
              ...voucherData,
              tipo_refeicao_id
            };

            const { data: novoVoucher, error: insertError } = await supabase
              .from('vouchers_extras')
              .insert([voucherWithMealType])
              .select()
              .single();

            if (insertError) throw insertError;

            vouchersGerados.push(novoVoucher);
          }
        } else {
          // Se não houver tipos de refeição, gera voucher simples
          const { data: novoVoucher, error: insertError } = await supabase
            .from('vouchers_extras')
            .insert([voucherData])
            .select()
            .single();

          if (insertError) throw insertError;

          vouchersGerados.push(novoVoucher);
        }

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