import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import logger from '@/config/logger';

export const useVouchers = () => {
  const fetchVouchers = async () => {
    try {
      logger.info('Iniciando busca de vouchers descartáveis ativos...');
      
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
        .gte('data_expiracao', new Date().toISOString())
        .order('data_criacao', { ascending: false });

      if (error) {
        logger.error('Erro ao buscar vouchers descartáveis:', error);
        throw error;
      }

      logger.info('Vouchers descartáveis encontrados:', {
        quantidade: data?.length || 0,
        primeiro: data?.[0] || null
      });

      return data || [];
    } catch (error) {
      logger.error('Erro ao buscar vouchers descartáveis:', error);
      throw error;
    }
  };

  return useQuery({
    queryKey: ['vouchers-descartaveis'],
    queryFn: fetchVouchers,
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  });
};