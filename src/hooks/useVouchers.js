import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import logger from '@/config/logger';

export const useVouchers = () => {
  return useQuery({
    queryKey: ['vouchers-descartaveis'],
    queryFn: async () => {
      try {
        logger.info('[INFO] Iniciando busca de vouchers descartáveis ativos...');
        
        const currentDate = new Date().toISOString();
        
        // Log da data atual para debug
        logger.info('Data atual para filtro:', currentDate);

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
          .is('usado_em', null)
          .is('data_uso', null)
          .gte('data_expiracao', currentDate)
          .order('data_criacao', { ascending: false });

        if (error) {
          logger.error('Erro ao buscar vouchers:', error);
          throw error;
        }

        // Log detalhado dos resultados
        logger.info('[INFO] Vouchers descartáveis encontrados:', {
          quantidade: data?.length || 0,
          primeiro: data?.[0] || null,
          query: {
            data_atual: currentDate,
            filtros: {
              usado_em: 'is null',
              data_uso: 'is null',
              data_expiracao: `>= ${currentDate}`
            }
          }
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