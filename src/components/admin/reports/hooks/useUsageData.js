import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import { toast } from "sonner";

export const useUsageData = (filters) => {
  return useQuery({
    queryKey: ['usage-data', filters],
    queryFn: async () => {
      try {
        console.log('Iniciando busca de dados com filtros:', filters);
        
        let query = supabase
          .from('vw_uso_voucher_detalhado')
          .select('*');

        if (filters.company && filters.company !== 'all') {
          query = query.eq('empresa_id', filters.company);
        }
        
        if (filters.startDate) {
          query = query.gte('data_uso', filters.startDate.toISOString());
        }
        
        if (filters.endDate) {
          query = query.lte('data_uso', filters.endDate.toISOString());
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
          console.error('Erro na consulta:', error);
          toast.error('Erro ao carregar dados');
          throw error;
        }

        console.log('Dados retornados:', data);
        return data || [];
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        toast.error('Erro ao carregar dados');
        throw error;
      }
    }
  });
};