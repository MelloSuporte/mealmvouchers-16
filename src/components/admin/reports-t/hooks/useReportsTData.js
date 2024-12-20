import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import { startOfDay, endOfDay } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { toast } from "sonner";
import logger from '@/config/logger';

export const useReportsTData = (filters) => {
  return useQuery({
    queryKey: ['reports-t-data', filters],
    queryFn: async () => {
      try {
        logger.info('Iniciando busca de dados do relatório T com filtros:', filters);

        if (!filters?.startDate || !filters?.endDate) {
          logger.warn('Datas não fornecidas para o relatório T');
          return [];
        }

        // Ajusta o fuso horário para UTC-3 (Brasil)
        const timeZone = 'America/Sao_Paulo';
        const startUtc = formatInTimeZone(startOfDay(filters.startDate), timeZone, "yyyy-MM-dd'T'HH:mm:ssX");
        const endUtc = formatInTimeZone(endOfDay(filters.endDate), timeZone, "yyyy-MM-dd'T'HH:mm:ssX");
        
        logger.info('Parâmetros de consulta:', {
          startDate: startUtc,
          endDate: endUtc,
          company: filters.company,
          shift: filters.shift,
          sector: filters.sector,
          mealType: filters.mealType
        });

        let query = supabase
          .from('vw_uso_voucher_detalhado')
          .select('*')
          .gte('data_uso', startUtc)
          .lte('data_uso', endUtc);

        logger.info('Construindo query com filtros adicionais');

        if (filters.company && filters.company !== 'all') {
          logger.info(`Aplicando filtro de empresa: ${filters.company}`);
          query = query.eq('empresa_id', filters.company);
        }

        if (filters.shift && filters.shift !== 'all') {
          logger.info(`Aplicando filtro de turno: ${filters.shift}`);
          query = query.eq('turno', filters.shift);
        }

        if (filters.sector && filters.sector !== 'all') {
          logger.info(`Aplicando filtro de setor: ${filters.sector}`);
          query = query.eq('setor_id', filters.sector);
        }

        if (filters.mealType && filters.mealType !== 'all') {
          logger.info(`Aplicando filtro de tipo de refeição: ${filters.mealType}`);
          query = query.eq('tipo_refeicao', filters.mealType);
        }

        const { data, error } = await query;

        if (error) {
          logger.error('Erro na consulta do relatório T:', {
            error: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
          });
          toast.error('Erro ao buscar dados: ' + error.message);
          throw error;
        }

        logger.info(`Consulta concluída. Registros encontrados: ${data?.length || 0}`);
        
        if (!data || data.length === 0) {
          logger.warn('Nenhum registro encontrado com os filtros aplicados', {
            filters: filters
          });
          return [];
        }

        return data;
      } catch (error) {
        logger.error('Erro ao buscar dados do relatório T:', {
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