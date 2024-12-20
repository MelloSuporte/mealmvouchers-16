import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import { startOfDay, endOfDay } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { toast } from "sonner";
import logger from '@/config/logger';

export const useUsageData = (filters) => {
  return useQuery({
    queryKey: ['usage-data', filters],
    queryFn: async () => {
      try {
        logger.info('Verificando sessão do usuário...');
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          logger.warn('Usuário não autenticado, mas continuando a busca...');
        }

        if (!filters?.startDate || !filters?.endDate) {
          logger.warn('Datas não fornecidas');
          return [];
        }

        // Ajusta o fuso horário para UTC-3 (Brasil)
        const timeZone = 'America/Sao_Paulo';
        const startUtc = formatInTimeZone(startOfDay(filters.startDate), timeZone, "yyyy-MM-dd'T'HH:mm:ssX");
        const endUtc = formatInTimeZone(endOfDay(filters.endDate), timeZone, "yyyy-MM-dd'T'HH:mm:ssX");

        logger.info('Construindo query base...');
        let query = supabase
          .from('vw_uso_voucher_detalhado')
          .select('*')
          .gte('data_uso', startUtc)
          .lte('data_uso', endUtc);

        if (filters.company && filters.company !== 'all') {
          logger.info(`Filtrando por empresa: ${filters.company}`);
          query = query.eq('empresa_id', filters.company);
        }

        if (filters.shift && filters.shift !== 'all') {
          logger.info(`Filtrando por turno: ${filters.shift}`);
          query = query.eq('turno', filters.shift);
        }

        if (filters.sector && filters.sector !== 'all') {
          logger.info(`Filtrando por setor: ${filters.sector}`);
          query = query.eq('setor_id', filters.sector);
        }

        if (filters.mealType && filters.mealType !== 'all') {
          logger.info(`Filtrando por tipo refeição: ${filters.mealType}`);
          query = query.eq('tipo_refeicao', filters.mealType);
        }

        logger.info('Executando query...');
        const { data, error, status, statusText } = await query;

        if (error) {
          logger.error('Erro detalhado na consulta:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
            status: status,
            statusText: statusText
          });
          toast.error('Erro ao buscar dados: ' + error.message);
          throw error;
        }

        logger.info('Dados retornados:', {
          totalRegistros: data?.length || 0,
          primeiroRegistro: data?.[0],
          ultimoRegistro: data?.[data?.length - 1]
        });

        return data || [];
      } catch (error) {
        logger.error('Erro detalhado ao buscar dados:', {
          name: error.name,
          message: error.message,
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