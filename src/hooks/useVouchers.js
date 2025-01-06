import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import logger from '@/config/logger';

export const useVouchers = () => {
  return useQuery({
    queryKey: ['vouchers-descartaveis'],
    queryFn: async () => {
      try {
        logger.info('[INFO] Iniciando busca de vouchers descartáveis...');
        
        // Query sem nenhum filtro primeiro
        const { data: todosVouchers, error: erroInicial } = await supabase
          .from('vouchers_descartaveis')
          .select('*');

        logger.info('Todos os vouchers:', todosVouchers);

        if (erroInicial) {
          logger.error('Erro ao buscar todos os vouchers:', erroInicial);
          throw erroInicial;
        }

        // Query apenas com o relacionamento, sem filtros
        const { data: vouchersComTipos, error: erroTipos } = await supabase
          .from('vouchers_descartaveis')
          .select(`
            *,
            tipos_refeicao (*)
          `);

        logger.info('Tipos de refeição recebidos:', vouchersComTipos);

        if (erroTipos) {
          logger.error('Erro ao buscar vouchers com tipos:', erroTipos);
          throw erroTipos;
        }

        // Agora sim aplicar os filtros
        const currentDate = new Date().toISOString();
        
        const { data, error } = await supabase
          .from('vouchers_descartaveis')
          .select(`
            id,
            codigo,
            tipo_refeicao_id,
            data_expiracao,
            usado_em,
            data_uso,
            data_criacao,
            tipos_refeicao (
              id,
              nome,
              valor,
              horario_inicio,
              horario_fim,
              minutos_tolerancia
            )
          `)
          .eq('usado_em', false)
          .gte('data_expiracao', currentDate)
          .order('data_criacao', { ascending: false });

        logger.info('Vouchers recebidos na tabela:', data);

        if (error) {
          logger.error('Erro na query final:', error);
          throw error;
        }

        return data || [];
      } catch (error) {
        logger.error('Erro ao buscar vouchers:', error);
        throw error;
      }
    },
    retry: 1,
    staleTime: 1000 * 60, // 1 minute
    refetchOnWindowFocus: false
  });
};