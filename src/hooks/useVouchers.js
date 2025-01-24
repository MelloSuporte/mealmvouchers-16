import { supabase } from '@/config/supabase';
import logger from '@/config/logger';

export const useVouchers = () => {
  return useQuery({
    queryKey: ['vouchers-descartaveis'],
    queryFn: async () => {
      try {
        logger.info('[INFO] Iniciando busca de vouchers descartáveis...');
        
        const { data, error } = await supabase
          .from('vouchers_descartaveis')
          .select(`
            id,
            codigo,
            tipo_refeicao_id,
            data_uso,
            data_requisicao,
            usado_em,
            nome_pessoa,
            nome_empresa,
            solicitante:admin_users(nome),
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
          .order('data_requisicao', { ascending: false });

        if (error) {
          logger.error('Erro ao buscar vouchers:', error);
          throw error;
        }

        // Map the data to get the solicitante name from the joined admin_users table
        const mappedData = data?.map(voucher => ({
          ...voucher,
          solicitante: voucher.solicitante?.nome || '-'
        }));

        logger.info('Vouchers recebidos:', mappedData);
        return mappedData || [];
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