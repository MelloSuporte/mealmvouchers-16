import { supabase } from '../config/supabase.js';
import logger from '../config/logger.js';
import { generateUniqueVoucherFromCPF } from '../utils/voucherGenerationUtils.js';

export const createVoucherExtra = async (req, res) => {
  const { usuario_id, datas, tipos_refeicao_ids, observacao, quantidade = 1 } = req.body;

  try {
    if (!datas || !Array.isArray(datas) || datas.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'É necessário fornecer pelo menos uma data válida'
      });
    }

    // Verificar datas passadas
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const hasInvalidDate = datas.some(date => {
      const dataVoucher = new Date(date);
      dataVoucher.setHours(0, 0, 0, 0);
      return dataVoucher < today;
    });

    if (hasInvalidDate) {
      return res.status(400).json({
        success: false,
        error: 'Não é possível gerar vouchers para datas passadas'
      });
    }

    // Buscar usuário para validação
    const { data: usuario, error: userError } = await supabase
      .from('usuarios')
      .select('id, cpf, nome')
      .eq('id', usuario_id)
      .single();

    if (userError || !usuario) {
      logger.error('Erro ao verificar usuário:', userError);
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    // Preparar vouchers para inserção
    const vouchersParaInserir = [];
    const refeicoes = tipos_refeicao_ids || [null];

    for (const data of datas) {
      for (let i = 0; i < quantidade; i++) {
        for (const tipo_refeicao_id of refeicoes) {
          const codigo = await generateUniqueVoucherFromCPF(usuario.cpf);
          
          const dataValidade = new Date(data);
          dataValidade.setHours(23, 59, 59, 0);
          
          vouchersParaInserir.push({
            usuario_id: usuario.id,
            tipo_refeicao_id,
            autorizado_por: 'Sistema',
            codigo,
            valido_ate: dataValidade.toISOString(),
            observacao: observacao?.trim() || 'Voucher extra gerado via sistema',
            usado: false,
            criado_em: new Date().toISOString()
          });
        }
      }
    }

    // Inserir vouchers no banco
    const { data: vouchersInseridos, error: insertError } = await supabase
      .from('vouchers_extras')
      .insert(vouchersParaInserir)
      .select();

    if (insertError) {
      logger.error('Erro ao inserir vouchers:', insertError);
      throw insertError;
    }

    return res.status(201).json({
      success: true,
      message: `${vouchersInseridos.length} voucher(s) extra(s) gerado(s) com sucesso!`,
      vouchers: vouchersInseridos
    });

  } catch (error) {
    logger.error('Erro ao gerar vouchers extras:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao gerar vouchers extras: ' + (error.message || error)
    });
  }
};