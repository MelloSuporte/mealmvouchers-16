import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import { startOfDay, endOfDay } from 'date-fns';
import { toast } from "sonner";

export const useReportsTData = (filters) => {
  return useQuery({
    queryKey: ['reports-t-data', filters],
    queryFn: async () => {
      try {
        console.log('Iniciando busca com filtros:', filters);
        
        if (!filters?.startDate || !filters?.endDate) {
          console.log('Datas não fornecidas');
          return [];
        }

        let query = supabase
          .from('vw_uso_voucher_detalhado')
          .select('*');

        // Formatar datas para o início e fim do dia
        const start = startOfDay(new Date(filters.startDate));
        const end = endOfDay(new Date(filters.endDate));
        
        console.log('Data início formatada:', start.toISOString());
        console.log('Data fim formatada:', end.toISOString());
        
        query = query
          .gte('data_uso', start.toISOString())
          .lte('data_uso', end.toISOString());

        if (filters.company && filters.company !== 'all') {
          console.log('Filtrando por empresa:', filters.company);
          query = query.eq('empresa_id', filters.company);
        }

        if (filters.shift && filters.shift !== 'all') {
          console.log('Filtrando por turno:', filters.shift);
          query = query.eq('turno_id', filters.shift);
        }

        if (filters.sector && filters.sector !== 'all') {
          console.log('Filtrando por setor:', filters.sector);
          query = query.eq('setor_id', parseInt(filters.sector));
        }

        if (filters.mealType && filters.mealType !== 'all') {
          console.log('Filtrando por tipo refeição:', filters.mealType);
          query = query.eq('tipo_refeicao_id', filters.mealType);
        }

        console.log('Query final:', query);
        const { data, error } = await query;

        if (error) {
          console.error('Erro na consulta:', error);
          toast.error('Erro ao buscar dados: ' + error.message);
          throw error;
        }

        console.log(`Encontrados ${data?.length || 0} registros`);
        
        if (data?.length === 0) {
          console.log('Nenhum registro encontrado com os filtros aplicados');
        } else {
          console.log('Primeiro registro:', data[0]);
        }

        return data || [];
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        toast.error('Falha ao carregar dados: ' + error.message);
        throw error;
      }
    },
    retry: 1,
    staleTime: 30000,
    cacheTime: 60000,
  });
};