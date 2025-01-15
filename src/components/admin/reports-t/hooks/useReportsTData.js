import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import logger from '@/config/logger';
import { checkVoucherRecords } from '../utils/databaseChecks';
import { toast } from 'sonner';

export const useReportsTData = (filters) => {
  return useQuery({
    queryKey: ['reports-data', filters],
    queryFn: async () => {
      try {
        // Verificar registros
        await checkVoucherRecords();

        logger.info('Iniciando busca de dados do relatório com filtros:', filters);

        // Construir query base usando a view correta
        let query = supabase
          .from('vw_uso_voucher_detalhado')
          .select(`
            id,
            data_uso,
            usuario_id,
            nome_usuario,
            cpf,
            empresa_id,
            nome_empresa,
            turno,
            setor_id,
            nome_setor,
            tipo_refeicao,
            valor_refeicao,
            observacao
          `);

        // Aplicar filtros
        if (filters.startDate) {
          const startDate = new Date(filters.startDate);
          startDate.setHours(0, 0, 0, 0);
          query = query.gte('data_uso', startDate.toISOString());
        }

        if (filters.endDate) {
          const endDate = new Date(filters.endDate);
          endDate.setHours(23, 59, 59, 999);
          query = query.lte('data_uso', endDate.toISOString());
        }

        if (filters.company && filters.company !== 'all') {
          query = query.eq('empresa_id', filters.company);
        }

        if (filters.shift && filters.shift !== 'all') {
          query = query.eq('turno', filters.shift);
        }

        if (filters.sector && filters.sector !== 'all') {
          query = query.eq('setor_id', filters.sector);
        }

        if (filters.mealType && filters.mealType !== 'all') {
          query = query.eq('tipo_refeicao', filters.mealType);
        }

        // Executar query
        const { data, error } = await query;

        if (error) {
          logger.error('Erro ao buscar dados:', error);
          toast.error('Erro ao carregar dados do relatório');
          throw error;
        }

        logger.info('Consulta filtrada retornou', data?.length || 0, 'registros');

        return data || [];
      } catch (error) {
        logger.error('Erro ao buscar dados:', error);
        toast.error('Erro ao carregar dados do relatório');
        throw error;
      }
    },
    retry: 1,
    staleTime: 30000,
    refetchOnWindowFocus: false
  });
};