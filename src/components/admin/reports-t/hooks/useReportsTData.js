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

        // If voucherType is 'descartavel', use existing logic
        if (filters.voucherType === 'descartavel') {
          let query = supabase
            .from('vouchers_descartaveis')
            .select(`
              id,
              codigo,
              usado_em,
              nome_pessoa,
              nome_empresa,
              tipos_refeicao (
                id,
                nome,
                valor
              )
            `);

          if (filters.startDate) {
            const startDate = new Date(filters.startDate);
            startDate.setHours(0, 0, 0, 0);
            query = query.gte('usado_em', startDate.toISOString());
          }

          if (filters.endDate) {
            const endDate = new Date(filters.endDate);
            endDate.setHours(23, 59, 59, 999);
            query = query.lte('usado_em', endDate.toISOString());
          }

          if (filters.company && filters.company !== 'all') {
            query = query.eq('nome_empresa', filters.company);
          }

          const { data, error } = await query;

          if (error) {
            logger.error('Erro ao buscar dados:', error);
            toast.error('Erro ao carregar dados do relatório');
            throw error;
          }

          const formattedData = data?.map(item => ({
            ...item,
            tipo_refeicao: item.tipos_refeicao?.nome,
            valor_refeicao: parseFloat(item.tipos_refeicao?.valor || 0)
          })) || [];

          logger.info('Consulta filtrada retornou', formattedData.length, 'registros');
          return formattedData;
        }
        
        // For common vouchers, use vw_uso_voucher_detalhado view
        else {
          let query = supabase
            .from('vw_uso_voucher_detalhado')
            .select('*')
            .eq('tipo_voucher', 'comum');

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

          const { data, error } = await query;

          if (error) {
            logger.error('Erro ao buscar dados:', error);
            toast.error('Erro ao carregar dados do relatório');
            throw error;
          }

          // Format data for common vouchers
          const formattedData = data?.map(item => ({
            id: item.id,
            usado_em: item.data_uso,
            nome_pessoa: item.nome_usuario,
            nome_empresa: item.nome_empresa,
            codigo: item.codigo_voucher,
            tipos_refeicao: {
              nome: item.tipo_refeicao,
              valor: item.valor_refeicao
            },
            turno: item.turno,
            setor: item.nome_setor
          })) || [];

          logger.info('Consulta filtrada retornou', formattedData.length, 'registros');
          return formattedData;
        }

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