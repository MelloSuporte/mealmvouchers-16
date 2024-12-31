import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import logger from '@/config/logger';

export const useVouchers = () => {
  return useQuery({
    queryKey: ['vouchers-descartaveis'],
    queryFn: async () => {
      try {
        logger.info('[INFO] Iniciando busca de vouchers descartáveis ativos...');

        // Buscar vouchers não usados diretamente
        const { data, error } = await supabase
          .from('vouchers_descartaveis')
          .select(`
            id,
            codigo,
            tipo_refeicao_id,
            data_expiracao,
            usado_em,
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
          .gte('data_expiracao', new Date().toISOString())
          .order('data_criacao', { ascending: false });

        if (error) {
          logger.error('Erro ao buscar vouchers:', error);
          throw error;
        }

        logger.info('[INFO] Vouchers descartáveis encontrados:', {
          quantidade: data?.length || 0,
          primeiro: data?.[0] || null
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