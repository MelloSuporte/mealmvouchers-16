import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import logger from '@/config/logger';

export const useVouchers = () => {
  return useQuery({
    queryKey: ['vouchers-descartaveis'],
    queryFn: async () => {
      try {
        logger.info('[INFO] Iniciando busca de vouchers descartáveis ativos...');

        // Primeiro, buscar IDs de vouchers usados
        const { data: usedVoucherIds, error: usedError } = await supabase
          .from('uso_voucher')
          .select('voucher_descartavel_id')
          .not('voucher_descartavel_id', 'is', null);

        if (usedError) {
          logger.error('Erro ao buscar vouchers usados:', usedError);
          throw usedError;
        }

        // Extrair array de IDs
        const usedIds = usedVoucherIds?.map(v => v.voucher_descartavel_id) || [];

        // Construir query base
        let query = supabase
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

        // Adicionar filtro not.in apenas se houver IDs usados
        if (usedIds.length > 0) {
          query = query.not('id', 'in', `(${usedIds.join(',')})`);
        }

        const { data, error } = await query;

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