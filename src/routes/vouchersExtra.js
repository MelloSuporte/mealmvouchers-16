import express from 'express';
import { supabase } from '../config/supabase.js';
import logger from '../config/logger.js';

const router = express.Router();

// Rota para gerar vouchers extras
router.post('/generate', async (req, res) => {
  const { usuario_id, datas, observacao } = req.body;

  logger.info('Iniciando geração de vouchers extras:', { usuario_id, datas });

  try {
    if (!usuario_id) {
      logger.warn('Tentativa de gerar voucher sem ID do usuário');
      return res.status(400).json({ 
        success: false,
        error: 'ID do usuário é obrigatório' 
      });
    }

    if (!datas || !Array.isArray(datas) || datas.length === 0) {
      logger.warn('Tentativa de gerar voucher sem datas válidas');
      return res.status(400).json({ 
        success: false,
        error: 'Selecione pelo menos uma data válida' 
      });
    }

    // Verificar se o usuário existe
    const { data: usuario, error: userError } = await supabase
      .from('usuarios')
      .select('id, nome, empresa_id')
      .eq('id', usuario_id)
      .single();

    if (userError) {
      logger.error('Erro ao buscar usuário:', userError);
      throw new Error('Erro ao verificar usuário');
    }

    if (!usuario) {
      logger.warn('Usuário não encontrado:', usuario_id);
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    const vouchers = [];
    const erros = [];
    
    for (const data of datas) {
      try {
        logger.info(`Processando voucher para data ${data}`);
        
        // Verificar se já existe voucher para esta data
        const { data: existingVoucher, error: checkError } = await supabase
          .from('vouchers_extras')
          .select('id')
          .eq('usuario_id', usuario_id)
          .eq('valido_ate', data)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          logger.error('Erro ao verificar voucher existente:', checkError);
          throw checkError;
        }

        if (existingVoucher) {
          logger.warn(`Voucher já existe para data ${data}`);
          erros.push(`Já existe um voucher para a data ${data}`);
          continue;
        }

        // Inserir novo voucher
        const { data: voucher, error: insertError } = await supabase
          .from('vouchers_extras')
          .insert({
            usuario_id: usuario_id,
            valido_ate: data,
            observacao: observacao || 'Voucher extra gerado pelo sistema',
            autorizado_por: 'Sistema',
            usado: false,
            empresa_id: usuario.empresa_id
          })
          .select()
          .single();

        if (insertError) {
          logger.error('Erro ao inserir voucher:', insertError);
          throw insertError;
        }

        logger.info('Voucher gerado com sucesso:', voucher.id);
        vouchers.push(voucher);
      } catch (error) {
        logger.error(`Erro ao processar data ${data}:`, error);
        erros.push(`Erro ao processar data ${data}: ${error.message}`);
      }
    }

    if (vouchers.length === 0) {
      const errorMessage = erros.length > 0 
        ? `Erro ao gerar vouchers: ${erros.join(', ')}` 
        : 'Não foi possível gerar nenhum voucher extra';
      
      logger.error('Falha ao gerar vouchers:', errorMessage);
      
      return res.status(400).json({
        success: false,
        error: errorMessage
      });
    }

    logger.info(`${vouchers.length} voucher(s) gerado(s) com sucesso`);

    return res.status(201).json({ 
      success: true,
      message: `${vouchers.length} voucher(s) extra(s) criado(s) com sucesso`,
      vouchers: vouchers,
      warnings: erros.length > 0 ? erros : undefined
    });

  } catch (error) {
    logger.error('Erro ao criar vouchers extras:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Erro ao gerar vouchers extras: ' + error.message
    });
  }
});

export default router;