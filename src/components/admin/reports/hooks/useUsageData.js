import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import { toast } from "sonner";

const buildQuery = (filters) => {
  let query = supabase
    .from('relatorio_uso_voucher')
    .select('*')
    .order('data_uso', { ascending: false });

  if (filters.startDate && filters.endDate) {
    query = query
      .gte('data_uso', filters.startDate.toISOString())
      .lte('data_uso', filters.endDate.toISOString());
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

  return query;
};

export const useUsageData = (filters) => {
  return useQuery({
    queryKey: ['usage-data', filters],
    queryFn: async () => {
      try {
        console.log('Buscando dados com filtros:', filters);
        
        const query = buildQuery(filters);
        const { data, error } = await query;

        if (error) {
          console.error('Erro ao buscar dados:', error);
          toast.error('Erro ao carregar dados do relatório');
          throw error;
        }

        console.log('Dados recuperados:', data?.length || 0, 'registros');
        return data || [];
      } catch (error) {
        console.error('Erro na query:', error);
        toast.error('Erro ao carregar dados do relatório');
        throw error;
      }
    },
    staleTime: 30000, // Cache por 30 segundos
    refetchOnWindowFocus: false
  });
};