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
        await checkVoucherRecords();

        logger.info('Iniciando busca de dados do relatório com filtros:', filters);

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
            observacao,
            voucher_descartavel_id
          `);

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

        const { data, error } = await query;

        if (error) {
          logger.error('Erro ao buscar dados:', error);
          toast.error('Erro ao carregar dados do relatório');
          throw error;
        }

        // Buscar informações adicionais dos vouchers descartáveis
        const voucherIds = data
          ?.filter(item => item.voucher_descartavel_id)
          .map(item => item.voucher_descartavel_id) || [];

        let processedData = [...(data || [])];

        if (voucherIds.length > 0) {
          const { data: vouchersData, error: vouchersError } = await supabase
            .from('vouchers_descartaveis')
            .select('id, codigo')
            .in('id', voucherIds);

          if (vouchersError) {
            logger.error('Erro ao buscar vouchers descartáveis:', vouchersError);
          } else if (vouchersData) {
            const voucherMap = new Map(vouchersData.map(v => [v.id, v]));
            
            processedData = processedData.map(item => {
              if (item.voucher_descartavel_id) {
                const voucher = voucherMap.get(item.voucher_descartavel_id);
                return {
                  ...item,
                  tipo: 'descartável',
                  codigo: voucher?.codigo
                };
              }
              return {
                ...item,
                tipo: 'comum'
              };
            });
          }
        } else {
          processedData = processedData.map(item => ({
            ...item,
            tipo: 'comum'
          }));
        }

        logger.info('Consulta filtrada retornou', processedData?.length || 0, 'registros');
        return processedData;
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