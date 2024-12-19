import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import { startOfDay, endOfDay } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { toast } from "sonner";

export const useReportsTData = (filters) => {
  return useQuery({
    queryKey: ['reports-t-data', filters],
    queryFn: async () => {
      try {
        if (!filters?.startDate || !filters?.endDate) {
          console.log('Datas não fornecidas');
          return [];
        }

        // Ajusta o fuso horário para UTC
        const timeZone = 'America/Sao_Paulo';
        const startUtc = formatInTimeZone(startOfDay(filters.startDate), timeZone, "yyyy-MM-dd'T'HH:mm:ssX");
        const endUtc = formatInTimeZone(endOfDay(filters.endDate), timeZone, "yyyy-MM-dd'T'HH:mm:ssX");
        
        console.log('Buscando dados com filtros:', {
          startDate: startUtc,
          endDate: endUtc,
          company: filters.company,
          shift: filters.shift,
          sector: filters.sector,
          mealType: filters.mealType
        });

        let query = supabase
          .from('relatorio_uso_voucher')
          .select('*')
          .gte('data_uso', startUtc)
          .lte('data_uso', endUtc);

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

        const { data, error, count } = await query;

        if (error) {
          console.error('Erro na consulta:', error);
          toast.error('Erro ao buscar dados: ' + error.message);
          throw error;
        }

        console.log(`Encontrados ${data?.length || 0} registros`);
        
        if (!data || data.length === 0) {
          console.log('Nenhum registro encontrado com os filtros aplicados');
          return [];
        }

        return data;
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
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