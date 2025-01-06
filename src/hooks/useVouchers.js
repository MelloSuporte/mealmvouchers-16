import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import logger from '@/config/logger';

export const useVouchers = () => {
  return useQuery({
    queryKey: ['vouchers-descartaveis'],
    queryFn: async () => {
      try {
        logger.info('[INFO] Iniciando busca de vouchers descartáveis...');
        
        // Simplificar a query inicial para debug
        const { data: allVouchers, error: initialError } = await supabase
          .from('vouchers_descartaveis')
          .select('*')
          .limit(100);

        // Log da query inicial para debug
        logger.info('Resultado da query inicial:', {
          total: allVouchers?.length || 0,
          error: initialError?.message,
          primeiros: allVouchers?.slice(0, 3)
        });

        if (initialError) {
          logger.error('Erro na query inicial:', initialError);
          throw initialError;
        }

        // Agora fazer a query com os filtros
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
          .is('data_uso', null)
          .gte('data_expiracao', currentDate)
          .order('data_criacao', { ascending: false });

        if (error) {
          logger.error('Erro na query com filtros:', error);
          throw error;
        }

        logger.info('Query com filtros executada. Resultado:', {
          totalFiltrado: data?.length || 0,
          filtros: {
            usado_em: false,
            data_uso: null,
            data_expiracao: `>= ${currentDate}`
          },
          primeirosResultados: data?.slice(0, 3)
        });

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