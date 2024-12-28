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
        logger.info('Iniciando busca de dados do relatório com filtros:', {
          company: filters?.company,
          startDate: filters?.startDate,
          endDate: filters?.endDate,
          shift: filters?.shift,
          sector: filters?.sector,
          mealType: filters?.mealType
        });

        await checkVoucherRecords();

        if (!filters?.startDate || !filters?.endDate) {
          logger.warn('Datas não fornecidas para o relatório. Retornando dados completos.');
          const allData = await fetchAllVoucherData();
          logger.info(`Busca completa retornou ${allData?.length || 0} registros`);
          return allData;
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
        
        logger.info('Parâmetros de consulta formatados:', {
          startDate: startUtc,
          endDate: endUtc,
          company: filters.company,
          shift: filters.shift,
          sector: filters.sector,
          mealType: filters.mealType
        });

        const filteredData = await fetchFilteredVoucherData(startUtc, endUtc, filters);
        
        logger.info(`Consulta filtrada retornou ${filteredData?.length || 0} registros`, {
          periodoInicio: startUtc,
          periodoFim: endUtc,
          totalRegistros: filteredData?.length || 0,
          primeiroRegistro: filteredData?.[0],
          ultimoRegistro: filteredData?.[filteredData?.length - 1]
        });

        return filteredData;

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