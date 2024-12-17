import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import { toast } from "sonner";

export const useUsageData = (filters) => {
  return useQuery({
    queryKey: ['usage-data', filters],
    queryFn: async () => {
      try {
        console.log('Buscando dados com filtros:', filters);
        
        let query = supabase
          .from('vw_uso_voucher_detalhado')
          .select('*');

        // Aplicar filtros
        if (filters.company && filters.company !== 'all') {
          query = query.eq('empresa_id', filters.company);
        }
        
        if (filters.startDate) {
          const startDate = new Date(filters.startDate);
          startDate.setUTCHours(0, 0, 0, 0);
          query = query.gte('data_uso', startDate.toISOString());
        }
        
        if (filters.endDate) {
          const endDate = new Date(filters.endDate);
          endDate.setUTCHours(23, 59, 59, 999);
          query = query.lte('data_uso', endDate.toISOString());
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

        console.log('Executando consulta...');
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Erro ao buscar dados:', error);
          toast.error('Erro ao carregar dados do relatório');
          throw error;
        }

        console.log('Dados retornados:', data);
        return data || [];
      } catch (error) {
        console.error('Erro na consulta:', error);
        toast.error('Erro ao carregar dados do relatório');
        throw error;
      }
    },
    retry: 1,
    staleTime: 30000,
    cacheTime: 60000,
  });
};