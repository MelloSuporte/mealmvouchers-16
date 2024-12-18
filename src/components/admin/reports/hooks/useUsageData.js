import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import { toast } from "sonner";
import { format, startOfDay, endOfDay } from 'date-fns';

export const useUsageData = (filters) => {
  return useQuery({
    queryKey: ['usage-data', filters],
    queryFn: async () => {
      try {
        console.log('Iniciando busca com filtros:', filters);
        
        // Validação básica dos filtros
        if (!filters?.startDate || !filters?.endDate) {
          console.log('Datas não fornecidas');
          return [];
        }

        // Construir query base
        let query = supabase
          .from('relatorio_uso_voucher')
          .select('*');

        // Aplicar filtro de data
        const start = startOfDay(new Date(filters.startDate));
        const end = endOfDay(new Date(filters.endDate));
        
        console.log('Data início:', start.toISOString());
        console.log('Data fim:', end.toISOString());
        
        query = query
          .gte('data_uso', start.toISOString())
          .lte('data_uso', end.toISOString());

        // Aplicar outros filtros se fornecidos
        if (filters.company && filters.company !== 'all') {
          console.log('Filtrando por empresa:', filters.company);
          query = query.eq('empresa_id', filters.company);
        }

        if (filters.shift && filters.shift !== 'all') {
          console.log('Filtrando por turno:', filters.shift);
          query = query.eq('turno', filters.shift);
        }

        if (filters.sector && filters.sector !== 'all') {
          console.log('Filtrando por setor:', filters.sector);
          query = query.eq('setor_id', filters.sector);
        }

        if (filters.mealType && filters.mealType !== 'all') {
          console.log('Filtrando por tipo refeição:', filters.mealType);
          query = query.eq('tipo_refeicao', filters.mealType);
        }

        // Executar query
        const { data, error } = await query;

        if (error) {
          console.error('Erro na consulta:', error);
          toast.error('Erro ao buscar dados');
          throw error;
        }

        console.log(`Encontrados ${data?.length || 0} registros`);
        
        if (data?.length === 0) {
          console.log('Nenhum registro encontrado com os filtros aplicados');
        }

        return data || [];
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        toast.error('Falha ao carregar dados');
        throw error;
      }
    },
    retry: 1,
    staleTime: 0,
    cacheTime: 0,
    refetchOnWindowFocus: false,
  });
};