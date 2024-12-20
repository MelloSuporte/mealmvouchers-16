import { useQuery } from '@tanstack/react-query';
import { formatInTimeZone } from 'date-fns-tz';
import { startOfDay, endOfDay } from 'date-fns';
import { toast } from "sonner";
import logger from '@/config/logger';
import { checkVoucherRecords } from '../utils/databaseChecks';
import { fetchAllVoucherData, fetchFilteredVoucherData } from '../utils/dataFetchers';

export const useReportsTData = (filters) => {
  return useQuery({
    queryKey: ['reports-t-data', filters],
    queryFn: async () => {
      try {
        logger.info('Iniciando busca de dados do relatório com filtros:', filters);

        await checkVoucherRecords();

        if (!filters?.startDate || !filters?.endDate) {
          logger.warn('Datas não fornecidas para o relatório');
          return fetchAllVoucherData();
        }

        const timeZone = 'America/Sao_Paulo';
        const startUtc = formatInTimeZone(
          startOfDay(filters.startDate), 
          timeZone, 
          "yyyy-MM-dd'T'HH:mm:ssXXX"
        );
        const endUtc = formatInTimeZone(
          endOfDay(filters.endDate), 
          timeZone, 
          "yyyy-MM-dd'T'HH:mm:ssXXX"
        );
        
        logger.info('Parâmetros de consulta:', {
          startDate: startUtc,
          endDate: endUtc,
          company: filters.company,
          shift: filters.shift,
          sector: filters.sector,
          mealType: filters.mealType
        });

        return fetchFilteredVoucherData(startUtc, endUtc, filters);

      } catch (error) {
        logger.error('Erro ao buscar dados do relatório:', {
          error: error.message,
          stack: error.stack,
          filters: filters
        });
        toast.error('Falha ao carregar dados: ' + error.message);
        throw error;
      }
    },
    retry: 1,
    staleTime: 0,
    cacheTime: 0,
    refetchOnWindowFocus: false,
  });
};